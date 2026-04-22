"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFHEDecrypt, useInMemoryStorage } from "fhevm-sdk";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useFhevm } from "fhevm-sdk";
import { BLIND_FACTOR_TOKEN_ABI, getBlindFactorDeployment } from "~~/contracts/blindfactor";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";

const INITIAL_MOCK_CHAINS = { 31337: "http://127.0.0.1:8545" } as const;

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export const useTokenBalance = () => {
  const { address, chainId } = useAccount();
  const { ethersReadonlyProvider, ethersSigner } = useWagmiEthers(INITIAL_MOCK_CHAINS);

  const walletProvider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    if (!window.ethereum) {
      console.info("[BlindFactor] No injected wallet provider detected for token balance decryption.");
      return undefined;
    }
    return window.ethereum;
  }, []);

  const { instance } = useFhevm({
    provider: walletProvider,
    chainId,
    initialMockChains: INITIAL_MOCK_CHAINS,
    enabled: !!address,
  });

  const deployment = getBlindFactorDeployment(chainId);
  const tokenAddress = deployment.tokenAddress;

  const [handle, setHandle] = useState<`0x${string}` | null>(null);
  const [revealed, setRevealed] = useState(false);
  const decryptCalledRef = useRef(false);

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const requests = useMemo(() => {
    if (!handle || !tokenAddress || !revealed) return undefined;
    return [{ handle, contractAddress: tokenAddress }];
  }, [handle, tokenAddress, revealed]);

  const decryptState = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage,
    chainId,
    requests,
  });

  const rawValue = handle ? decryptState.results[handle] : undefined;
  const formatted =
    rawValue !== undefined && rawValue !== null
      ? (Number(rawValue) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })
      : null;

  useEffect(() => {
    if (!address || !tokenAddress || !ethersReadonlyProvider) return;
    const token = new ethers.Contract(tokenAddress, BLIND_FACTOR_TOKEN_ABI, ethersReadonlyProvider);
    token.confidentialBalanceOf(address)
      .then((h: `0x${string}`) => setHandle(h))
      .catch((err: unknown) => console.error("[BalancePill] confidentialBalanceOf failed:", err));
  }, [address, tokenAddress, ethersReadonlyProvider]);

  // Trigger decrypt exactly once after revealed becomes true and canDecrypt is ready
  useEffect(() => {
    if (!revealed || decryptCalledRef.current || !decryptState.canDecrypt) return;
    decryptCalledRef.current = true;
    decryptState.decrypt();
  }, [revealed, decryptState.canDecrypt, decryptState.decrypt]);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  return {
    balance: formatted,
    isDecrypting: decryptState.isDecrypting,
    isRevealed: revealed,
    reveal,
    isConnected: !!address,
  };
};
