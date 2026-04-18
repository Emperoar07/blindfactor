"use client";

import Link from "next/link";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

const HowItWorksStep = ({
  step,
  title,
  body,
  accent,
}: {
  step: string;
  title: string;
  body: string;
  accent: string;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-[rgba(180,165,140,0.25)] bg-white/80 p-6 transition hover:shadow-lg hover:-translate-y-0.5">
    <div
      className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${accent}`}
    >
      {step}
    </div>
    <h3 className="text-lg font-bold text-[#0f1117]">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-[#7a6f63]">{body}</p>
  </div>
);

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 border border-white/15 px-5 py-4 backdrop-blur-sm">
    <span className="text-2xl font-bold text-[#fdfaf4]">{value}</span>
    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#fdfaf4]/60">{label}</span>
  </div>
);

export const BlindFactorLanding = () => {
  const { requests, chainId, networkWarning } = useBlindFactorMarket();

  const openCount = requests.filter(r => r.status === 0).length;
  const totalCount = requests.length;

  return (
    <div className="w-full space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#0f1117]">
        <div className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, #e8a825 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #2d7a5f 0%, transparent 40%)",
          }}
        />
        <div className="relative px-8 py-14 md:px-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-7">
              <div className="flex items-center gap-3">
                <span className="bf-encrypt-badge">
                  <span className="bf-lock-dot" />
                  Powered by Zama FHEVM
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-[1.08] text-[#fdfaf4] md:text-6xl">
                  Invoice financing.{" "}
                  <span className="text-[#e8a825]">Completely confidential.</span>
                </h1>
                <p className="max-w-xl text-base leading-8 text-[#fdfaf4]/65">
                  BlindFactor lets borrowers raise working capital and lenders compete for yield without either party
                  ever seeing the other&apos;s numbers. The math runs on encrypted values the whole way through.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/borrower" className="bf-btn-gold">
                  I need financing
                </Link>
                <Link
                  href="/lender"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-[#fdfaf4] transition hover:border-[#e8a825] hover:text-[#e8a825]"
                >
                  I want to lend
                </Link>
              </div>

              {networkWarning ? (
                <p className="rounded-xl bg-[#e8a825]/15 border border-[#e8a825]/30 px-4 py-3 text-sm text-[#e8a825]">
                  {networkWarning}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col justify-center gap-4">
              <div className="grid grid-cols-2 gap-3">
                <StatPill label="Live requests" value={String(openCount)} />
                <StatPill label="Total rounds" value={String(totalCount)} />
                <StatPill label="Settlement" value="bfUSD" />
                <StatPill label="Chain" value={chainId === 11155111 ? "Sepolia" : chainId === 31337 ? "Local" : "..."} />
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#fdfaf4]/40 mb-2">FHE guarantee</p>
                <p className="text-sm leading-6 text-[#fdfaf4]/60">
                  Invoice amounts, bid terms, and repayment figures are sealed on chain. The winning bid is computed homomorphically. Neither party sees what they should not see.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <HowItWorksStep
          step="01"
          title="Borrower posts encrypted request"
          body="The borrower submits their invoice value and minimum acceptable payout under FHE encryption. The due date and request status are public. The economics are not."
          accent="bg-[#fdf4dc] text-[#7a4f00]"
        />
        <HowItWorksStep
          step="02"
          title="Lenders bid without seeing rivals"
          body="Up to three lenders submit encrypted bids. The contract evaluates each bid homomorphically and silently updates the leading offer as bids arrive."
          accent="bg-[#d4ede6] text-[#1a5c45]"
        />
        <HowItWorksStep
          step="03"
          title="Borrower decrypts, accepts, and gets funded"
          body="When bidding closes the borrower decrypts the winner privately, accepts the lender on chain, and the selected lender sends a confidential settlement transfer."
          accent="bg-[#0f1117] text-[#e8a825]"
        />
      </section>

      <section className="rounded-2xl border border-[rgba(180,165,140,0.25)] bg-white/60 p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="bf-label">Ready to participate?</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0f1117]">Pick your role and connect a wallet</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/borrower" className="bf-btn-primary">
              Open borrower desk
            </Link>
            <Link href="/lender" className="bf-btn-outline">
              Open lender desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
