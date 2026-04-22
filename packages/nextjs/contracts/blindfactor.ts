"use client";

export const BLIND_FACTOR_MARKET_ABI = [
  {
    inputs: [],
    name: "nextRequestId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "getRequestMeta",
    outputs: [
      {
        components: [
          { internalType: "address", name: "borrower", type: "address" },
          { internalType: "uint64", name: "dueAt", type: "uint64" },
          { internalType: "uint64", name: "biddingEndsAt", type: "uint64" },
          { internalType: "bytes32", name: "invoiceRefHash", type: "bytes32" },
          { internalType: "enum BlindFactorMarket.RequestStatus", name: "status", type: "uint8" },
          { internalType: "uint32", name: "bidCount", type: "uint32" },
          { internalType: "address", name: "acceptedLender", type: "address" },
          { internalType: "bool", name: "hasAnyBid", type: "bool" },
        ],
        internalType: "struct BlindFactorMarket.RequestMeta",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "address", name: "lender", type: "address" },
    ],
    name: "getLenderBidId",
    outputs: [
      { internalType: "uint32", name: "bidId", type: "uint32" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint64", name: "encInvoiceAmount", type: "bytes32" },
      { internalType: "externalEuint64", name: "encMinPayout", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
      { internalType: "uint64", name: "dueAt", type: "uint64" },
      { internalType: "uint64", name: "biddingEndsAt", type: "uint64" },
      { internalType: "bytes32", name: "invoiceRefHash", type: "bytes32" },
    ],
    name: "createRequest",
    outputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "externalEuint64", name: "encPayoutNow", type: "bytes32" },
      { internalType: "externalEuint64", name: "encRepaymentAtDue", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "submitBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "closeBidding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint32", name: "winningBidIdClear", type: "uint32" },
      { internalType: "bytes", name: "decryptionProof", type: "bytes" },
    ],
    name: "acceptWinningBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "fundAcceptedRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "bool", name: "fundingSucceeded", type: "bool" },
      { internalType: "bytes", name: "decryptionProof", type: "bytes" },
    ],
    name: "proveFunding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "markRepaid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "bool", name: "repaymentSucceeded", type: "bool" },
      { internalType: "bytes", name: "decryptionProof", type: "bytes" },
    ],
    name: "proveRepayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "getWinningBidIdHandle",
    outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "getWinningPayoutHandle",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "getWinningRepaymentHandle",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "getFundingSuccessHandle",
    outputs: [{ internalType: "ebool", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "getRepaymentSuccessHandle",
    outputs: [{ internalType: "ebool", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "getRequestPrivateHandles",
    outputs: [
      { internalType: "euint64", name: "invoiceAmount", type: "bytes32" },
      { internalType: "euint64", name: "minPayout", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint32", name: "bidId", type: "uint32" },
    ],
    name: "getBidMeta",
    outputs: [
      {
        components: [
          { internalType: "address", name: "lender", type: "address" },
          { internalType: "uint32", name: "requestId", type: "uint32" },
          { internalType: "bool", name: "exists", type: "bool" },
          { internalType: "bool", name: "accepted", type: "bool" },
        ],
        internalType: "struct BlindFactorMarket.BidMeta",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint32", name: "bidId", type: "uint32" },
    ],
    name: "getOwnBidHandles",
    outputs: [
      { internalType: "euint64", name: "payoutNow", type: "bytes32" },
      { internalType: "euint64", name: "repaymentAtDue", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const BLIND_FACTOR_TOKEN_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "confidentialBalanceOf",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "euint64", name: "amount", type: "bytes32" },
    ],
    name: "marketTransferFrom",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
      { internalType: "ebool", name: "success", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "lastFaucetClaim",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FAUCET_COOLDOWN",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FAUCET_AMOUNT",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

type BlindFactorDeployment = {
  marketAddress?: `0x${string}`;
  tokenAddress?: `0x${string}`;
};

const LOCAL_DEFAULTS: BlindFactorDeployment = {
  marketAddress: "0x62D08B289Be94808632976fd8A90F9F9CE0611a8",
  tokenAddress: "0x23f51eAa3274c4051D9B0c28143778f8DfAa10CE",
};

const SEPOLIA_DEFAULTS: BlindFactorDeployment = {
  marketAddress: "0x983e37af5797B69479fCB6B8Dc5dE88A21C57eeB",
  tokenAddress: "0xB30b83482df69d1ac5a3c132dfFda86212A028f4",
};

export const getBlindFactorDeployment = (chainId?: number): BlindFactorDeployment => {
  if (chainId === 31337) {
    return {
      marketAddress:
        (process.env.NEXT_PUBLIC_BLINDFACTOR_MARKET_LOCAL as `0x${string}` | undefined) ?? LOCAL_DEFAULTS.marketAddress,
      tokenAddress:
        (process.env.NEXT_PUBLIC_BLINDFACTOR_TOKEN_LOCAL as `0x${string}` | undefined) ?? LOCAL_DEFAULTS.tokenAddress,
    };
  }

  if (chainId === 11155111) {
    return {
      marketAddress:
        (process.env.NEXT_PUBLIC_BLINDFACTOR_MARKET_SEPOLIA as `0x${string}` | undefined) ??
        SEPOLIA_DEFAULTS.marketAddress,
      tokenAddress:
        (process.env.NEXT_PUBLIC_BLINDFACTOR_TOKEN_SEPOLIA as `0x${string}` | undefined) ??
        SEPOLIA_DEFAULTS.tokenAddress,
    };
  }

  return {};
};

export const BLIND_FACTOR_REQUEST_STATUS = {
  0: "Open",
  1: "Bidding Closed",
  2: "Winner Computed",
  3: "Funded",
  4: "Repaid",
  5: "Defaulted",
  6: "Cancelled",
  7: "Funding Submitted",
  8: "Repayment Submitted",
} as const;
