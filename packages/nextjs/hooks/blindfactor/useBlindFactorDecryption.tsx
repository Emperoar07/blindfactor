"use client";

import { useMemo } from "react";
import { useFHEDecrypt, useInMemoryStorage } from "@fhevm-sdk";
import { ethers } from "ethers";

export type BlindFactorDecryptItem = {
  key: string;
  label: string;
  handle: `0x${string}`;
  contractAddress: `0x${string}`;
};

export const useBlindFactorDecryption = (parameters: {
  instance: any;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  chainId: number | undefined;
  items: BlindFactorDecryptItem[];
}) => {
  const { instance, ethersSigner, chainId, items } = parameters;
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const requests = useMemo(
    () =>
      items.map(item => ({
        handle: item.handle,
        contractAddress: item.contractAddress,
      })),
    [items],
  );

  const decryptState = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage,
    chainId,
    requests: requests.length > 0 ? requests : undefined,
  });

  const valuesByKey = useMemo(() => {
    return items.reduce<Record<string, string | bigint | boolean | undefined>>((accumulator, item) => {
      accumulator[item.key] = decryptState.results[item.handle];
      return accumulator;
    }, {});
  }, [items, decryptState.results]);

  return {
    ...decryptState,
    valuesByKey,
  } as const;
};
