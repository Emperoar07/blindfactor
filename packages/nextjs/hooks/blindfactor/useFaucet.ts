"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { BLIND_FACTOR_TOKEN_ABI, getBlindFactorDeployment } from "~~/contracts/blindfactor";

export const useFaucet = () => {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deployment = getBlindFactorDeployment(chainId);
  const tokenAddress = deployment.tokenAddress;

  const claim = async () => {
    if (!address || !walletClient || !publicClient || !tokenAddress) return;
    setIsPending(true);
    setMessage(null);
    setError(null);
    try {
      const lastClaim = await publicClient.readContract({
        address: tokenAddress,
        abi: BLIND_FACTOR_TOKEN_ABI,
        functionName: "lastFaucetClaim",
        args: [address],
      }) as bigint;

      const cooldown = 86400n;
      const now = BigInt(Math.floor(Date.now() / 1000));
      const availableAt = lastClaim + cooldown;
      if (now < availableAt) {
        const hoursLeft = Math.ceil(Number(availableAt - now) / 3600);
        setError(`Already claimed. Try again in ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}.`);
        return;
      }

      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: BLIND_FACTOR_TOKEN_ABI,
        functionName: "faucet",
        args: [],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setMessage("10,000 bfUSD sent to your wallet. Ready to use.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("FaucetCooldown")) {
        setError("Already claimed today. Come back in 24 hours.");
      } else {
        setError(msg.slice(0, 120));
      }
    } finally {
      setIsPending(false);
    }
  };

  return { claim, isPending, message, error, isConnected: !!address, tokenAddress };
};
