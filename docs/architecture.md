# BlindFactor Architecture

## System Shape

BlindFactor uses a simple monorepo split:

1. `packages/hardhat` for contracts, tests, and deployment
2. `packages/nextjs` for the app router frontend
3. `packages/fhevm-sdk` for reusable FHEVM relayer hooks

## Smart Contracts

### BlindFactorMarket

`BlindFactorMarket.sol` owns the product flow:

1. request creation
2. encrypted bid submission
3. incremental winner tracking
4. proof backed borrower acceptance
5. funding submission and proof state
6. repayment submission and proof state

Public request metadata stores:

1. borrower
2. due date
3. bidding end
4. invoice reference hash
5. request status
6. bid count
7. accepted lender

Encrypted request data stores:

1. invoice amount
2. minimum payout
3. winning bid id
4. winning payout
5. winning repayment amount

### BlindFactorToken

`BlindFactorToken.sol` is the confidential settlement rail:

1. confidential balances as encrypted `euint64`
2. owner minting for demo liquidity
3. confidential user transfers
4. market controlled transfer path for request funding and repayment

## Winner Logic

BlindFactor uses incremental winner tracking instead of a later full loop:

1. lender submits encrypted `payoutNow`
2. lender submits encrypted `repaymentAtDue`
3. contract computes `meetsMin`
4. contract computes whether the candidate payout beats the current winner
5. `FHE.select` updates the winning payout, repayment, and bid id

This keeps the ranking logic private and avoids plaintext branching on encrypted values.

Only the winning bid id is made publicly decryptable after bidding closes. The payout and repayment values remain restricted to authorized users. Acceptance requires a public decryption proof for the winning bid id, which prevents the borrower from substituting a different bid id.

## ACL Rules

The repo follows strict encrypted handle access rules:

1. request terms are allowed to borrower plus contract
2. bid terms are allowed to lender plus contract
3. winning outputs are allowed to borrower plus contract
4. funding and repayment handoff use transient access only for same transaction execution
5. every stored encrypted mutation is followed by fresh ACL grants
6. funding and repayment success flags are made publicly decryptable only after transfer attempts so public status is not marked proven until a KMS proof confirms success

## Frontend Flow

The Next.js frontend is split into three user facing surfaces:

1. landing page with product explanation
2. borrower desk for request creation and winner acceptance
3. lender desk for bidding and funding
4. request room for role specific actions on a single request

The frontend uses:

1. `useFhevm` for the relayer aware instance
2. `useBlindFactorEncryption` for request and bid input encryption
3. `useBlindFactorDecryption` for borrower and lender handle decryption
4. `useBlindFactorMarket` for all read and write orchestration

## Deployment Model

The Builder Track target is Sepolia.

Local development still uses hardhat and localhost:

1. deterministic local addresses are wired into `packages/nextjs/contracts/blindfactor.ts`
2. Sepolia addresses are provided through env vars after deployment

## Why This Architecture

The repo intentionally keeps the MVP narrow:

1. one borrower flow
2. up to three lenders
3. one confidential settlement token
4. one complete request to funding story

That keeps the implementation aligned with the judging criteria instead of drifting into features that do not improve the demo.
