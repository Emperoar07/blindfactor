# BlindFactor Pitch Script

## Opening

Public blockchains are great for settlement, but they are terrible for commercial finance because every financing term leaks by default.

## Problem

If a business wants liquidity against an invoice onchain, a normal smart contract exposes:

1. invoice size
2. financing threshold
3. lender bids
4. repayment expectations

That is commercially sensitive information, which makes real invoice financing hard to bring onchain with standard Solidity alone.

## Solution

BlindFactor is a confidential invoice financing marketplace built on Zama.

Borrowers create financing requests with encrypted invoice amount and minimum payout. Lenders submit encrypted bids. The contract keeps the best valid offer privately updated using FHE logic. The borrower decrypts only the winning result, accepts the lender, and settlement happens with a confidential token.

## Demo Beat

Here the borrower creates a request.

Here lender A and lender B submit encrypted bids.

Here the borrower closes bidding and decrypts the winner.

Here the borrower accepts the winning bid id with a public decryption proof, preventing winner substitution.

Here the selected lender funds the request through the confidential settlement token, and the app proves the encrypted success flag before marking it funded.

## Why FHE Matters

This is not privacy theatre.

The chain still verifies execution, but it does not expose the deal terms that make invoice financing commercially sensitive in the first place.

## Close

BlindFactor brings private credit workflows onchain with verifiable execution and confidential terms.
