"use client";

import Link from "next/link";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

const MetricCard = ({ title, value, copy }: { title: string; value: string; copy: string }) => (
  <div className="rounded-[2rem] border border-white/30 bg-white/70 p-5 shadow-[0_20px_70px_rgba(42,27,8,0.10)] backdrop-blur">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">{title}</p>
    <p className="mt-3 text-3xl font-semibold text-stone-900">{value}</p>
    <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
  </div>
);

export const BlindFactorLanding = () => {
  const { requests, chainId, networkWarning } = useBlindFactorMarket();

  return (
    <div className="w-full">
      <section className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,243,220,0.95),_rgba(232,225,213,0.95)_45%,_rgba(216,204,182,0.9)_100%)] p-8 shadow-[0_30px_120px_rgba(65,44,15,0.12)] md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">BlindFactor</p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] text-stone-950 md:text-6xl">
                Private invoice financing for onchain business cash flow.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700">
                BlindFactor lets a borrower publish financing workflow without exposing invoice size, minimum acceptable
                payout, lender bids, or repayment terms. The chain verifies the market. FHE keeps the economics sealed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/borrower"
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-700"
              >
                Open borrower desk
              </Link>
              <Link
                href="/lender"
                className="inline-flex items-center justify-center rounded-full border border-stone-950 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-950 hover:text-stone-50"
              >
                Open lender desk
              </Link>
            </div>

            {networkWarning ? (
              <p className="rounded-3xl bg-white/70 px-4 py-3 text-sm text-amber-900">{networkWarning}</p>
            ) : null}
          </div>

          <div className="grid gap-4">
            <MetricCard
              title="Live requests"
              value={String(requests.length)}
              copy="Borrower workflow is public. Terms are decrypted only by authorized wallets."
            />
            <MetricCard
              title="Network"
              value={chainId ? String(chainId) : "No wallet"}
              copy="Local hardhat is prewired for builder testing. Sepolia addresses can be injected through environment variables."
            />
            <MetricCard
              title="Settlement rail"
              value="bfUSD"
              copy="Winning lender funding and borrower repayment move through a confidential settlement token."
            />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">1. Borrower request</p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-900">Public coordination, encrypted terms</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            The borrower creates a request with encrypted invoice amount and minimum acceptable payout while keeping due
            date and request status visible.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">2. Lender bids</p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-900">Incremental winner tracking</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Up to three lenders submit encrypted bids. BlindFactor updates the best valid payout privately as each bid
            arrives.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">3. Funding</p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-900">Decrypt, accept, and fund</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            The borrower decrypts the winner, accepts the selected lender, and the accepted lender funds the request
            with the confidential settlement token.
          </p>
        </div>
      </section>
    </div>
  );
};
