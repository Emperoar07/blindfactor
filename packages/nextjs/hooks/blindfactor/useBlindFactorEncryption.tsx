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
    if (!Number.isInteger(invoiceAmount) || invoiceAmount <= 0) throw new Error("Invoice amount must be a positive integer.");
    if (!Number.isInteger(minPayout) || minPayout <= 0) throw new Error("Minimum payout must be a positive integer.");
    if (minPayout > invoiceAmount) throw new Error("Minimum payout cannot exceed invoice amount.");
    return encryptWith(builder => {
      builder.add64(invoiceAmount);
      builder.add64(minPayout);
    });
  };

  const encryptBidTerms = async (payoutNow: number, repaymentAtDue: number) => {
    if (!Number.isInteger(payoutNow) || payoutNow <= 0) throw new Error("Payout now must be a positive integer.");
    if (!Number.isInteger(repaymentAtDue) || repaymentAtDue <= 0) throw new Error("Repayment must be a positive integer.");
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
