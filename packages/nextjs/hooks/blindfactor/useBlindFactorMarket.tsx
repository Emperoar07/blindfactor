"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlindFactorEncryption } from "./useBlindFactorEncryption";
import { useFhevm } from "fhevm-sdk";
import { ethers } from "ethers";
import {
  BLIND_FACTOR_MARKET_ABI,
  BLIND_FACTOR_REQUEST_STATUS,
  BLIND_FACTOR_TOKEN_ABI,
  getBlindFactorDeployment,
} from "~~/contracts/blindfactor";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";

const INITIAL_MOCK_CHAINS = {
  31337: "http://127.0.0.1:8545",
} as const;

export const BLIND_FACTOR_ACTIONS = {
  createRequest: "Create request",
  submitBid: "Submit bid",
  closeBidding: "Close bidding",
  acceptWinningBid: "Accept winning bid",
  fundRequest: "Fund request",
  markRepaid: "Mark repaid",
} as const;

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export type BlindFactorRequest = {
  id: number;
  borrower: string;
  dueAt: number;
  biddingEndsAt: number;
  invoiceRefHash: string;
  status: number;
  statusLabel: string;
  bidCount: number;
  acceptedLender: string;
  myBidId?: number;
  hasMyBid: boolean;
};

export type CreateRequestPayload = {
  invoiceAmount: number;
  minPayout: number;
  biddingHours: number;
  dueDays: number;
  invoiceRef: string;
};

export type SubmitBidPayload = {
  requestId: number;
  payoutNow: number;
  repaymentAtDue: number;
};

type BlindFactorHandleItem = {
  key: string;
  label: string;
  handle: `0x${string}`;
  contractAddress: `0x${string}`;
};

export const useBlindFactorMarket = () => {
  const { chainId, accounts, isConnected, ethersReadonlyProvider, ethersSigner } = useWagmiEthers(INITIAL_MOCK_CHAINS);
  const currentAccount = accounts?.[0];

  const walletProvider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    if (!window.ethereum) {
      console.info("[BlindFactor] No injected wallet provider detected.");
      return undefined;
    }
    return window.ethereum;
  }, []);

  const {
    instance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider: walletProvider,
    chainId,
    initialMockChains: INITIAL_MOCK_CHAINS,
    enabled: true,
  });

  const deployment = useMemo(() => getBlindFactorDeployment(chainId), [chainId]);
  const marketAddress = deployment.marketAddress;
  const tokenAddress = deployment.tokenAddress;
  const hasDeployment = Boolean(marketAddress && tokenAddress);

  const marketReadContract = useMemo(() => {
    if (!marketAddress || !ethersReadonlyProvider) return undefined;
    return new ethers.Contract(marketAddress, BLIND_FACTOR_MARKET_ABI, ethersReadonlyProvider);
  }, [marketAddress, ethersReadonlyProvider]);

  const marketWriteContract = useMemo(() => {
    if (!marketAddress || !ethersSigner) return undefined;
    return new ethers.Contract(marketAddress, BLIND_FACTOR_MARKET_ABI, ethersSigner);
  }, [marketAddress, ethersSigner]);

  const tokenReadContract = useMemo(() => {
    if (!tokenAddress || !ethersReadonlyProvider) return undefined;
    return new ethers.Contract(tokenAddress, BLIND_FACTOR_TOKEN_ABI, ethersReadonlyProvider);
  }, [tokenAddress, ethersReadonlyProvider]);

  const { canEncrypt, encryptRequestTerms, encryptBidTerms } = useBlindFactorEncryption({
    instance,
    ethersSigner,
    contractAddress: marketAddress,
  });

  const [requests, setRequests] = useState<BlindFactorRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [activityMessage, setActivityMessage] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<string>("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const loadGeneration = useRef(0);

  const refresh = useCallback(() => {
    setRefreshIndex(value => value + 1);
  }, []);

  const loadRequests = useCallback(async () => {
    if (!marketReadContract) {
      setRequests([]);
      return;
    }

    const generation = ++loadGeneration.current;
    setIsLoadingRequests(true);
    try {
      const nextRequestId = Number(await marketReadContract.nextRequestId());
      const nextRequests = await Promise.all(
        Array.from({ length: nextRequestId }, async (_, requestId) => {
          const meta = await marketReadContract.getRequestMeta(BigInt(requestId));
          const bidLookup =
            currentAccount != null
              ? await marketReadContract
                  .getLenderBidId(BigInt(requestId), currentAccount)
                  .catch((err: unknown) => {
                    console.error(`[BlindFactor] getLenderBidId failed for request ${requestId}:`, err);
                    return { bidId: 0, exists: false };
                  })
              : { bidId: 0, exists: false };

          const status = Number(meta.status);
          return {
            id: requestId,
            borrower: meta.borrower,
            dueAt: Number(meta.dueAt),
            biddingEndsAt: Number(meta.biddingEndsAt),
            invoiceRefHash: meta.invoiceRefHash,
            status,
            statusLabel:
              BLIND_FACTOR_REQUEST_STATUS[status as keyof typeof BLIND_FACTOR_REQUEST_STATUS] ?? `Status ${status}`,
            bidCount: Number(meta.bidCount),
            acceptedLender: meta.acceptedLender,
            myBidId: Boolean(bidLookup.exists) ? Number(bidLookup.bidId) : undefined,
            hasMyBid: Boolean(bidLookup.exists),
          } satisfies BlindFactorRequest;
        }),
      );

      if (generation !== loadGeneration.current) return;
      setRequests(nextRequests.reverse());
    } catch (error) {
      if (generation !== loadGeneration.current) return;
      setActivityMessage(
        `Unable to load BlindFactor requests: ${error instanceof Error ? error.message : String(error)}`,
      );
      setRequests([]);
    } finally {
      if (generation === loadGeneration.current) {
        setIsLoadingRequests(false);
      }
    }
  }, [marketReadContract, currentAccount]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests, refreshIndex]);

  const runWrite = useCallback(
    async (label: string, callback: () => Promise<any>) => {
      if (!marketWriteContract || !currentAccount) {
        throw new Error("Connect a wallet with the BlindFactor deployment selected.");
      }

      setPendingAction(label);
      setActivityMessage(`${label} submitted...`);
      try {
        const tx = await callback();
        await tx.wait();
        setActivityMessage(`${label} confirmed onchain.`);
        refresh();
      } catch (error) {
        console.error(`[BlindFactor] ${label} failed:`, error);
        const raw = error instanceof Error ? error.message : String(error);
        const shortMessage = raw.length > 120 ? `${raw.slice(0, 120)}...` : raw;
        setActivityMessage(`${label} failed: ${shortMessage}`);
        throw error;
      } finally {
        setPendingAction("");
      }
    },
    [marketWriteContract, currentAccount, refresh],
  );

  const createRequest = useCallback(
    async (payload: CreateRequestPayload) => {
      if (!marketWriteContract || !canEncrypt) {
        throw new Error("Encryption is not ready for the current wallet and network.");
      }

      const encrypted = await encryptRequestTerms(payload.invoiceAmount, payload.minPayout);
      if (!encrypted) {
        throw new Error("Failed to encrypt BlindFactor request terms.");
      }

      const now = Math.floor(Date.now() / 1000);
      const biddingEndsAt = now + payload.biddingHours * 60 * 60;
      const dueAt = biddingEndsAt + payload.dueDays * 24 * 60 * 60;

      await runWrite(BLIND_FACTOR_ACTIONS.createRequest, () =>
        marketWriteContract.createRequest(
          ethers.hexlify(encrypted.handles[0]),
          ethers.hexlify(encrypted.handles[1]),
          ethers.hexlify(encrypted.inputProof),
          BigInt(dueAt),
          BigInt(biddingEndsAt),
          ethers.id(payload.invoiceRef.trim()),
        ),
      );
    },
    [marketWriteContract, canEncrypt, encryptRequestTerms, runWrite],
  );

  const submitBid = useCallback(
    async (payload: SubmitBidPayload) => {
      if (!marketWriteContract || !canEncrypt) {
        throw new Error("Encryption is not ready for the current wallet and network.");
      }

      const encrypted = await encryptBidTerms(payload.payoutNow, payload.repaymentAtDue);
      if (!encrypted) {
        throw new Error("Failed to encrypt BlindFactor bid terms.");
      }

      await runWrite(BLIND_FACTOR_ACTIONS.submitBid, () =>
        marketWriteContract.submitBid(
          BigInt(payload.requestId),
          ethers.hexlify(encrypted.handles[0]),
          ethers.hexlify(encrypted.handles[1]),
          ethers.hexlify(encrypted.inputProof),
        ),
      );
    },
    [marketWriteContract, canEncrypt, encryptBidTerms, runWrite],
  );

  const closeBidding = useCallback(
    async (requestId: number) => {
      await runWrite(BLIND_FACTOR_ACTIONS.closeBidding, () => marketWriteContract!.closeBidding(BigInt(requestId)));
    },
    [marketWriteContract, runWrite],
  );

  const acceptWinningBid = useCallback(
    async (requestId: number, winningBidIdClear: number) => {
      await runWrite(BLIND_FACTOR_ACTIONS.acceptWinningBid, () =>
        marketWriteContract!.acceptWinningBid(BigInt(requestId), BigInt(winningBidIdClear)),
      );
    },
    [marketWriteContract, runWrite],
  );

  const fundAcceptedRequest = useCallback(
    async (requestId: number) => {
      await runWrite(BLIND_FACTOR_ACTIONS.fundRequest, () => marketWriteContract!.fundAcceptedRequest(BigInt(requestId)));
    },
    [marketWriteContract, runWrite],
  );

  const markRepaid = useCallback(
    async (requestId: number) => {
      await runWrite(BLIND_FACTOR_ACTIONS.markRepaid, () => marketWriteContract!.markRepaid(BigInt(requestId)));
    },
    [marketWriteContract, runWrite],
  );

  const getRequestById = useCallback(
    (requestId: number) => requests.find(request => request.id === requestId),
    [requests],
  );

  const loadRequestTermsItems = useCallback(
    async (requestId: number): Promise<BlindFactorHandleItem[]> => {
      if (!marketReadContract || !marketAddress) return [];
      try {
        const [invoiceAmount, minPayout] = await marketReadContract.getRequestPrivateHandles(BigInt(requestId));
        return [
          { key: "invoiceAmount", label: "Invoice amount", handle: invoiceAmount, contractAddress: marketAddress },
          { key: "minPayout", label: "Minimum payout", handle: minPayout, contractAddress: marketAddress },
        ];
      } catch (error) {
        console.error(`[BlindFactor] loadRequestTermsItems failed for request ${requestId}:`, error);
        return [];
      }
    },
    [marketReadContract, marketAddress],
  );

  const loadWinningItems = useCallback(
    async (requestId: number): Promise<BlindFactorHandleItem[]> => {
      if (!marketReadContract || !marketAddress) return [];

      const borrowerItems: BlindFactorHandleItem[] = await (async () => {
        try {
          const [winningBidId, winningPayout] = await Promise.all([
            marketReadContract.getWinningBidIdHandle(BigInt(requestId)),
            marketReadContract.getWinningPayoutHandle(BigInt(requestId)),
          ]);
          return [
            { key: "winningBidId", label: "Winning bid id", handle: winningBidId, contractAddress: marketAddress },
            { key: "winningPayout", label: "Winning payout", handle: winningPayout, contractAddress: marketAddress },
          ];
        } catch (error) {
          console.debug("[loadWinningItems] borrower handles not available for this wallet:", error);
          return [];
        }
      })();

      const repaymentItem: BlindFactorHandleItem | null = await (async () => {
        try {
          const winningRepayment = await marketReadContract.getWinningRepaymentHandle(BigInt(requestId));
          return {
            key: "winningRepayment",
            label: "Repayment at due date",
            handle: winningRepayment,
            contractAddress: marketAddress,
          };
        } catch (error) {
          console.debug("[loadWinningItems] repayment handle not available for this wallet:", error);
          return null;
        }
      })();

      return [...borrowerItems, ...(repaymentItem ? [repaymentItem] : [])];
    },
    [marketReadContract, marketAddress],
  );

  const loadOwnBidItems = useCallback(
    async (requestId: number, bidId: number): Promise<BlindFactorHandleItem[]> => {
      if (!marketReadContract || !marketAddress) return [];
      try {
        const [payoutNow, repaymentAtDue] = await marketReadContract.getOwnBidHandles(BigInt(requestId), bidId);
        return [
          { key: "payoutNow", label: "Payout now", handle: payoutNow, contractAddress: marketAddress },
          {
            key: "repaymentAtDue",
            label: "Repayment at due date",
            handle: repaymentAtDue,
            contractAddress: marketAddress,
          },
        ];
      } catch (error) {
        console.error(`[BlindFactor] loadOwnBidItems failed for request ${requestId}, bid ${bidId}:`, error);
        return [];
      }
    },
    [marketReadContract, marketAddress],
  );

  const loadBalanceItems = useCallback(async (): Promise<BlindFactorHandleItem[]> => {
    if (!tokenReadContract || !tokenAddress || !currentAccount) return [];
    try {
      const balanceHandle = await tokenReadContract.confidentialBalanceOf(currentAccount);
      return [{ key: "balance", label: "Confidential balance", handle: balanceHandle, contractAddress: tokenAddress }];
    } catch (error) {
      console.error("[BlindFactor] loadBalanceItems failed:", error);
      return [];
    }
  }, [tokenReadContract, tokenAddress, currentAccount]);

  const networkWarning = (() => {
    if (hasDeployment || !chainId) return "";
    if (chainId === 11155111) {
      return "Sepolia deployment addresses are not set yet. Add NEXT_PUBLIC_BLINDFACTOR_MARKET_SEPOLIA and NEXT_PUBLIC_BLINDFACTOR_TOKEN_SEPOLIA after deployment.";
    }
    return "BlindFactor is currently wired for local hardhat or Sepolia only.";
  })();

  return {
    chainId,
    currentAccount,
    isConnected,
    instance,
    fhevmStatus,
    fhevmError,
    ethersSigner,
    marketAddress,
    tokenAddress,
    hasDeployment,
    canEncrypt,
    requests,
    isLoadingRequests,
    activityMessage,
    pendingAction,
    refresh,
    createRequest,
    submitBid,
    closeBidding,
    acceptWinningBid,
    fundAcceptedRequest,
    markRepaid,
    getRequestById,
    loadRequestTermsItems,
    loadWinningItems,
    loadOwnBidItems,
    loadBalanceItems,
    networkWarning,
  } as const;
};
