"use client";

import { useFHEEncryption } from "@fhevm-sdk";
import { ethers } from "ethers";

export const useBlindFactorEncryption = (parameters: {
  instance: any;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  contractAddress: `0x${string}` | undefined;
}) => {
  const { encryptWith, canEncrypt } = useFHEEncryption(parameters as any);

  const encryptRequestTerms = async (invoiceAmount: number, minPayout: number) => {
    return encryptWith(builder => {
      builder.add64(invoiceAmount);
      builder.add64(minPayout);
    });
  };

  const encryptBidTerms = async (payoutNow: number, repaymentAtDue: number) => {
    return encryptWith(builder => {
      builder.add64(payoutNow);
      builder.add64(repaymentAtDue);
    });
  };

  return {
    canEncrypt,
    encryptRequestTerms,
    encryptBidTerms,
  } as const;
};
