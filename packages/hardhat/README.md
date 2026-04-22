# BlindFactor Hardhat Package

This package contains the BlindFactor smart contracts, deployment script, and FHEVM tests.

## Contracts

- `contracts/BlindFactorMarket.sol`
- `contracts/BlindFactorToken.sol`

## Commands

```bash
pnpm compile
pnpm test
pnpm deploy:localhost
pnpm deploy:sepolia
```

## Notes

BlindFactor targets Sepolia for the Builder Track demo. Local tests use the FHEVM mock environment and cover encrypted
request creation, sealed lender bids, proof backed winner acceptance, confidential funding, and confidential repayment.
