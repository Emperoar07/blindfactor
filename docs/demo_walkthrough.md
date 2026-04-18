# BlindFactor Demo Walkthrough

## Goal

Show one complete confidential invoice financing story in under three minutes.

## Actors

1. borrower
2. lender A
3. lender B

## Demo Script

### 1. Open the landing page

Show:

1. BlindFactor headline
2. borrower desk link
3. lender desk link

Narration:

BlindFactor is private invoice financing for onchain business cash flow.

### 2. Borrower creates a request

Open the borrower desk and connect the borrower wallet.

Fill:

1. invoice amount
2. minimum payout
3. bidding window
4. due date offset
5. invoice reference

Click create.

Narration:

The workflow is public, but the invoice amount and financing threshold are encrypted before they ever hit the contract.

### 3. Lenders submit bids

Open the lender desk with lender A and lender B.

For each lender:

1. decrypt the lender balance
2. submit an encrypted bid

Narration:

Each lender can bid without exposing payout terms publicly. The contract still updates the best valid offer privately.

### 4. Borrower closes bidding

Back on the borrower desk:

1. close bidding
2. load winning handles
3. decrypt the winner

Show:

1. winning bid id
2. winning payout
3. repayment amount

Narration:

Only the borrower can decrypt the winning result here. Losing bids stay confidential.

### 5. Borrower accepts the winner

1. copy the winning bid id into the acceptance input
2. accept the bid

Narration:

The borrower now accepts the selected lender using the decrypted winning bid id.

### 6. Winning lender funds the request

Switch to the winning lender wallet.

1. open the request room or lender desk
2. click fund request

Narration:

Funding is visible as state progression, but the transfer amount itself comes from the encrypted winning payout.

## What To Emphasize

1. this is finance native
2. FHE is necessary, not decorative
3. lender bids remain private
4. borrower only decrypts what the workflow needs
5. settlement uses a confidential token
