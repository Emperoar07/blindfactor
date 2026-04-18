# BlindFactor

BlindFactor is a confidential invoice financing dApp built on the Zama Protocol. It lets a borrower publish a financing workflow without exposing invoice size, minimum acceptable payout, lender bids, or repayment terms onchain.

The MVP proves one complete story:

1. borrower creates a financing request
2. invoice amount and minimum payout are encrypted
3. up to three lenders submit encrypted bids
4. the contract tracks the best valid bid incrementally
5. borrower decrypts the winner and accepts the selected lender
6. the winning lender funds the borrower with the confidential settlement token

## Overview

BlindFactor is designed for the Zama Developer Program Builder Track. The app focuses on a finance native use case where FHE is clearly necessary: businesses need invoice liquidity, but public chains leak commercially sensitive deal terms.

This repo contains:

1. `packages/hardhat` with the BlindFactor contracts, tests, and deploy script
2. `packages/nextjs` with the borrower desk, lender desk, and request detail frontend
3. `packages/fhevm-sdk` with the relayer helper hooks reused by the app
4. `.devnotes/` local onboarding notes that stay ignored and are meant for builders only

## Problem

Public smart contracts are a poor fit for invoice financing because they expose:

1. invoice size
2. borrower financing threshold
3. lender bids
4. repayment terms
5. counterparties and negotiation dynamics

BlindFactor keeps workflow state public for coordination while keeping the money terms encrypted.

## Why FHE

BlindFactor relies on FHEVM patterns that standard Solidity cannot provide safely:

1. encrypted `euint64` values for request and bid terms
2. `FHE.fromExternal` for user supplied encrypted inputs
3. `FHE.select` for encrypted winner selection logic
4. explicit ACL grants after every encrypted mutation
5. user decryption through the relayer for borrower and lender specific views

## Product Flow

### Borrower

1. opens the borrower desk
2. encrypts `invoiceAmount` and `minPayout`
3. creates a financing request with a due date and bidding deadline
4. closes bidding when ready
5. decrypts the winning bid outputs
6. accepts the winning bid id
7. marks the request repaid after funding

### Lender

1. opens the lender desk
2. decrypts their own confidential balance
3. submits an encrypted bid with `payoutNow` and `repaymentAtDue`
4. decrypts only their own bid terms
5. funds the request only if selected and accepted

## Architecture

High level architecture is documented in [docs/architecture.md](docs/architecture.md).

Main contracts:

1. `packages/hardhat/contracts/BlindFactorMarket.sol`
2. `packages/hardhat/contracts/BlindFactorToken.sol`

Main frontend entry points:

1. `packages/nextjs/app/page.tsx`
2. `packages/nextjs/app/borrower/page.tsx`
3. `packages/nextjs/app/lender/page.tsx`
4. `packages/nextjs/app/requests/[id]/page.tsx`

Frontend contract config and hooks:

1. `packages/nextjs/contracts/blindfactor.ts`
2. `packages/nextjs/hooks/blindfactor/useBlindFactorMarket.tsx`
3. `packages/nextjs/hooks/blindfactor/useBlindFactorEncryption.tsx`
4. `packages/nextjs/hooks/blindfactor/useBlindFactorDecryption.tsx`

## Local Setup

```bash
git clone <your-blindfactor-repo-url>
cd BlindFactor-zama
pnpm install
pnpm compile
pnpm test
```

To run the app locally:

```bash
pnpm chain
pnpm deploy:localhost
pnpm start
```

Notes:

1. the frontend is prewired with deterministic local addresses for the default hardhat deployment path
2. for a full funded local flow use `pnpm chain` plus `pnpm deploy:localhost`
3. `NEXT_PUBLIC_ALCHEMY_API_KEY` is optional because the app falls back to public RPCs

## Sepolia Deployment

BlindFactor is wired for Sepolia as the Builder Track submission target.

Deploy:

```bash
pnpm deploy:sepolia
```

Then set the frontend env vars:

1. `NEXT_PUBLIC_BLINDFACTOR_MARKET_SEPOLIA`
2. `NEXT_PUBLIC_BLINDFACTOR_TOKEN_SEPOLIA`
3. optionally `NEXT_PUBLIC_ALCHEMY_API_KEY`
4. optionally `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

Current live Sepolia deployment:

1. `BlindFactorMarket`: `0x9D8Fd01A7bb63BBA5513d8Ed7d46839E16Ae46bC`
2. `BlindFactorToken`: `0x086eb01D2983b7E4bbB7A1EF519d741FBd350038`

The frontend now falls back to these deployed Sepolia addresses by default and still allows env overrides when needed.

## Test Status

Verified in this repo:

1. `pnpm hardhat:compile`
2. `pnpm test`
3. `pnpm next:check-types`
4. `pnpm next:lint`
5. `pnpm next:build`

BlindFactor specific Hardhat tests cover:

1. confidential request creation
2. lender only bid decryption
3. incremental winner tracking
4. borrower winner decryption
5. acceptance, funding, and repayment flow
6. confidential token minting and transfer behavior

## Demo Walkthrough

The demo flow is documented in [docs/demo_walkthrough.md](docs/demo_walkthrough.md).

Short version:

1. connect borrower wallet
2. create request
3. connect lender A and lender B
4. submit encrypted bids
5. borrower closes bidding
6. borrower decrypts winning outputs and accepts the winning bid id
7. accepted lender funds the request

## Pitch Prep

A sample 3 minute pitch script lives in [docs/pitch_script.md](docs/pitch_script.md).

## Current Caveats

1. the deploy script skips demo liquidity minting on the ephemeral `hardhat` network because trivial encryption fails on that path during deployment
2. funded local demos should use `localhost` deployment, not the one shot ephemeral hardhat deployment
3. Sepolia frontend addresses are intentionally env driven until live deployment is finalized

## License

BSD 3 Clause Clear. See [LICENSE](LICENSE).
