"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFHEDecrypt, useInMemoryStorage } from "@fhevm-sdk";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { BLIND_FACTOR_TOKEN_ABI, getBlindFactorDeployment } from "~~/contracts/blindfactor";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";
import { useFhevm } from "@fhevm-sdk";

const INITIAL_MOCK_CHAINS = { 31337: "http://127.0.0.1:8545" } as const;

export const useTokenBalance = () => {
  const { address, chainId } = useAccount();
  const { ethersReadonlyProvider, ethersSigner } = useWagmiEthers(INITIAL_MOCK_CHAINS);

  const walletProvider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
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

  const fetchHandle = useCallback(async () => {
    if (!address || !tokenAddress || !ethersReadonlyProvider) return;
    try {
      const token = new ethers.Contract(tokenAddress, BLIND_FACTOR_TOKEN_ABI, ethersReadonlyProvider);
      const h = await token.confidentialBalanceOf(address) as `0x${string}`;
      setHandle(h);
    } catch {
      // silently ignore — handle unavailable
    }
  }, [address, tokenAddress, ethersReadonlyProvider]);

  useEffect(() => {
    void fetchHandle();
  }, [fetchHandle]);

  const reveal = useCallback(async () => {
    await fetchHandle();
    setRevealed(true);
    if (decryptState.canDecrypt) {
      await decryptState.decrypt();
    }
  }, [fetchHandle, decryptState]);

  useEffect(() => {
    if (revealed && decryptState.canDecrypt) {
      void decryptState.decrypt();
    }
  }, [revealed, decryptState.canDecrypt]);

  return {
    balance: formatted,
    isDecrypting: decryptState.isDecrypting,
    hasHandle: !!handle,
    isRevealed: revealed,
    reveal,
    isConnected: !!address,
  };
};
