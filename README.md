# BlindFactor

BlindFactor is a confidential invoice financing protocol built on Ethereum using Zama FHEVM. Borrowers post financing requests without exposing invoice size or minimum terms. Lenders compete with sealed bids. The winning offer is computed on encrypted data and only the authorized wallet can reveal the result.

Live app: [blindfactor.vercel.app](https://blindfactor.vercel.app)

## What it does

1. Borrower encrypts invoice amount and minimum acceptable payout in the browser
2. Up to three lenders submit encrypted bids with their offered payout and requested repayment
3. The contract evaluates bids using FHE arithmetic and tracks the best valid offer without decrypting any value
4. Borrower decrypts the winning outputs privately, then accepts the selected lender on chain
5. The winning lender funds the borrower with a confidential bfUSD transfer
6. Borrower repays the lender at maturity, also as a confidential transfer

## Why FHE

Public smart contracts are a poor fit for invoice financing. They expose invoice size, financing thresholds, competitor bids, repayment terms, and counterparty dynamics. BlindFactor uses FHEVM to keep all money terms encrypted while keeping workflow state public for coordination.

Specific FHEVM patterns used:

1. `euint64` encrypted values for request and bid terms
2. `FHE.fromExternal` for user supplied encrypted inputs with proofs
3. `FHE.select` and `FHE.gt` for encrypted winner selection without decryption
4. Explicit ACL grants after every encrypted mutation
5. User decryption through the Zama relayer for borrower and lender specific views

## Repository structure

```
packages/
  hardhat/      contracts, tests, deploy scripts
  nextjs/       borrower desk, lender desk, request room, docs frontend
  fhevm-sdk/    relayer helper hooks shared by the app
```

## Smart contracts

Main contracts:

- `packages/hardhat/contracts/BlindFactorMarket.sol`
- `packages/hardhat/contracts/BlindFactorToken.sol`

Current Sepolia deployment:

- `BlindFactorMarket`: `0x983e37af5797B69479fCB6B8Dc5dE88A21C57eeB`
- `BlindFactorToken`: `0xB30b83482df69d1ac5a3c132dfFda86212A028f4`

## Frontend

Built with Next.js, Wagmi, RainbowKit, and the Zama FHEVM relayer SDK.

Main entry points:

- `packages/nextjs/app/page.tsx` — landing page
- `packages/nextjs/app/borrower/page.tsx` — borrower desk
- `packages/nextjs/app/lender/page.tsx` — lender desk
- `packages/nextjs/app/request/page.tsx` — request detail (`/request?id=<id>`)
- `packages/nextjs/app/docs/page.tsx` — in-app documentation

Frontend contract config and hooks:

- `packages/nextjs/contracts/blindfactor.ts`
- `packages/nextjs/hooks/blindfactor/useBlindFactorMarket.tsx`
- `packages/nextjs/hooks/blindfactor/useBlindFactorEncryption.tsx`
- `packages/nextjs/hooks/blindfactor/useBlindFactorDecryption.tsx`
- `packages/nextjs/hooks/blindfactor/useFaucet.ts`
- `packages/nextjs/hooks/blindfactor/useTokenBalance.ts`

## Settlement token

bfUSD is a confidential ERC20 token where all balances and transfer amounts are stored as `euint64` ciphertexts. The market contract moves tokens between parties using `marketTransferFrom` with encrypted amounts. A testnet faucet on the landing page dispenses 10,000 bfUSD per wallet every 24 hours.

Token details:

- Name: BlindFactor USD
- Symbol: bfUSD
- Decimals: 6

## Local setup

```bash
git clone https://github.com/Emperoar07/blindfactor
cd BlindFactor-zama
pnpm install
pnpm compile
pnpm test
```

Run locally:

```bash
pnpm chain
pnpm deploy:localhost
pnpm start
```

The frontend is prewired with deterministic local addresses for the default Hardhat deployment path. For a full funded local flow use `pnpm chain` then `pnpm deploy:localhost`.

## Sepolia deployment

The app targets Sepolia as the primary network. Hardhat is excluded from the wallet network picker.

Deploy the contracts:

```bash
pnpm deploy:sepolia
```

Optional env vars (the app falls back to the hardcoded Sepolia addresses if unset):

```
NEXT_PUBLIC_BLINDFACTOR_MARKET_SEPOLIA
NEXT_PUBLIC_BLINDFACTOR_TOKEN_SEPOLIA
NEXT_PUBLIC_ALCHEMY_API_KEY
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
```

## Test coverage

BlindFactor specific Hardhat tests cover:

1. Confidential request creation
2. Lender-only bid decryption
3. Incremental winner tracking across multiple bids
4. Borrower winner decryption
5. Acceptance, funding, and repayment flow
6. Confidential token minting and transfer behavior
7. Faucet cooldown enforcement

Verified commands:

```bash
pnpm hardhat:compile
pnpm test
pnpm next:check-types
pnpm next:lint
pnpm next:build
```

## License

BSD 3 Clause Clear. See [LICENSE](LICENSE).
