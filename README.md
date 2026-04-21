# BlindFactor

BlindFactor is a confidential invoice financing protocol built on Ethereum using Zama FHEVM. Borrowers post financing requests without exposing invoice size or minimum terms. Lenders compete with sealed bids. The winning offer is computed on encrypted data and only the authorized wallet can reveal the result.

Live app: [blindfactor.vercel.app](https://blindfactor.vercel.app)

## The problem

Public smart contracts expose everything. For invoice financing this means:

- Invoice size is visible to every competitor
- Lender bids are visible to other lenders, removing competitive pricing
- Repayment terms and counterparty identity are public record
- Borrowers signal financial distress by posting a request at all

BlindFactor keeps all money terms encrypted while keeping coordination state public so the protocol can still function.

## How it works

### Step 1. Borrower creates a financing request

The borrower navigates to the Borrower desk, connects their wallet, and fills in:

- **Invoice amount** — the face value of the invoice being financed, in bfUSD
- **Minimum payout** — the lowest upfront amount they will accept from a lender
- **Bidding window** — how many hours lenders have to submit bids
- **Days until repayment** — how long before the borrower repays the winning lender
- **Invoice reference** — a short label hashed on chain for record keeping

Before the transaction is broadcast, the invoice amount and minimum payout are encrypted in the browser using Zama FHEVM. The smart contract receives only ciphertexts. No one reading the chain can see the deal terms.

### Step 2. Lenders submit sealed bids

Lenders open the Lender desk to browse open financing requests. For each request they want to bid on, they enter:

- **Payout now** — what they will send the borrower upfront if selected
- **Repayment at due date** — what they expect back from the borrower at maturity

Both values are encrypted in the browser before the transaction. The smart contract uses FHE arithmetic to evaluate each new bid against the current best offer without decrypting either value. If the new bid is better and meets the borrower minimum, the contract silently updates the winner. No individual bid is ever revealed.

### Step 3. Borrower closes bidding and decrypts the winner

After the bidding window closes, or earlier if the borrower chooses, they close bidding from the request card. They then use the decrypt panel to reveal the winning bid outputs to their own wallet only. This requires a wallet signature to authorize the decryption.

Once decrypted, the borrower enters the winning bid id into the accept form to lock the selection on chain.

### Step 4. Winning lender funds the request

The accepted lender sees a Fund button on the request card. Clicking it initiates a confidential bfUSD transfer from the lender wallet to the borrower for the encrypted winning payout amount. The transfer amount stays encrypted throughout.

### Step 5. Borrower repays at maturity

At or before the due date, the borrower uses Mark repaid on the request card. This triggers a confidential bfUSD transfer from the borrower back to the lender for the agreed repayment amount.

## User guide

### Getting test tokens

A testnet faucet is available on the landing page. Connect your wallet and click Claim 10,000 bfUSD. Each wallet can claim once every 24 hours. You need bfUSD to participate as a lender. Borrowers do not need tokens to create a request.

### Running a full demo

You need at least two wallets. One acts as borrower, one as lender.

1. Connect the borrower wallet on the Borrower desk
2. Create a financing request with your chosen terms
3. Switch to the lender wallet and open the Lender desk
4. Locate the open request and submit an encrypted bid
5. Switch back to the borrower wallet
6. Close bidding from the request card
7. Use the Winning outputs decrypt panel to reveal the winner
8. Accept the winning bid by entering the bid id
9. Switch to the lender wallet and fund the accepted request
10. Switch back to the borrower wallet and mark the request repaid

### Checking your bfUSD balance

The header shows a bfUSD balance pill when your wallet is connected. Click it once to trigger FHE decryption. Your wallet will prompt for a signature to authorize the reveal. The decrypted balance appears in the header and persists until you refresh.

## Why FHE

BlindFactor relies on FHEVM operations that standard Solidity cannot provide safely:

1. `euint64` encrypted integers for request and bid terms
2. `FHE.fromExternal` for user supplied encrypted inputs with on chain proof verification
3. `FHE.ge` and `FHE.gt` for encrypted comparisons without revealing values
4. `FHE.select` for conditional winner updates without plaintext branching
5. Explicit ACL grants after every encrypted mutation so only authorized wallets can decrypt their own data
6. User decryption through the Zama relayer for borrower and lender specific views

## Repository structure

```
packages/
  hardhat/      contracts, tests, deploy scripts
  nextjs/       borrower desk, lender desk, request room, docs frontend
  fhevm-sdk/    relayer helper hooks shared by the app
```

## Smart contracts

- `packages/hardhat/contracts/BlindFactorMarket.sol`
- `packages/hardhat/contracts/BlindFactorToken.sol`

Current Sepolia deployment:

- BlindFactorMarket: `0x983e37af5797B69479fCB6B8Dc5dE88A21C57eeB`
- BlindFactorToken: `0xB30b83482df69d1ac5a3c132dfFda86212A028f4`

## Frontend entry points

- `packages/nextjs/app/page.tsx` — landing page
- `packages/nextjs/app/borrower/page.tsx` — borrower desk
- `packages/nextjs/app/lender/page.tsx` — lender desk
- `packages/nextjs/app/request/page.tsx` — request detail (`/request?id=<id>`)
- `packages/nextjs/app/docs/page.tsx` — in app documentation

## Settlement token

bfUSD is a confidential ERC20 token. All balances and transfer amounts are stored as `euint64` ciphertexts. The market contract moves tokens between parties using `marketTransferFrom` with encrypted amounts. Standard balance checks and transfers use FHE comparisons without revealing amounts.

Token details:

- Name: BlindFactor USD
- Symbol: bfUSD
- Decimals: 6
- Faucet: 10,000 bfUSD per wallet per 24 hours from the landing page

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

## Sepolia deployment

The app targets Sepolia as the primary network.

```bash
pnpm deploy:sepolia
```

Optional environment variables (the app falls back to the hardcoded Sepolia addresses if unset):

```
NEXT_PUBLIC_BLINDFACTOR_MARKET_SEPOLIA
NEXT_PUBLIC_BLINDFACTOR_TOKEN_SEPOLIA
NEXT_PUBLIC_ALCHEMY_API_KEY
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
```

## Tests

```bash
pnpm hardhat:compile
pnpm test
pnpm next:check-types
pnpm next:lint
pnpm next:build
```

Test coverage includes confidential request creation, incremental winner tracking across multiple bids, lender only bid decryption, borrower winner decryption, acceptance and funding and repayment flow, confidential token transfers, and faucet cooldown enforcement.

## License

BSD 3 Clause Clear. See [LICENSE](LICENSE).
