"use client";

import Link from "next/link";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

const HowItWorksStep = ({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-[#ede4d5] bg-[#fffcf7] p-9">
    <div className="text-[52px] font-bold text-[#ede4d5] leading-none mb-4" style={{fontFamily:"'Fraunces',Georgia,serif"}}>{step}</div>
    <h3 className="text-base font-semibold text-[#1a1208] mb-2">{title}</h3>
    <p className="text-sm leading-relaxed text-[#6b5b4e]">{body}</p>
  </div>
);


export const BlindFactorLanding = () => {
  const { requests, chainId, networkWarning } = useBlindFactorMarket();

  const openCount = requests.filter(r => r.status === 0).length;
  const totalCount = requests.length;

  return (
    <div className="w-full">
      {/* ── HERO ── */}
      <section className="bg-[#c45c2e] relative overflow-hidden">
        {/* decorative circles */}
        <div className="pointer-events-none absolute right-[-80px] top-[-80px] w-[420px] h-[420px] rounded-full border-[90px] border-white/5" />
        <div className="pointer-events-none absolute right-[120px] bottom-[-40px] w-[200px] h-[200px] rounded-full border-[40px] border-white/4" />

        <div className="relative mx-auto max-w-7xl px-6 py-[72px]">
          <div className="inline-flex items-center gap-2 bg-white/12 rounded px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white/90 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            FHE Protected · Ethereum Sepolia
          </div>
          <h1 className="text-[clamp(38px,6vw,68px)] font-light leading-[1.05] text-white max-w-[640px] mb-6" style={{fontFamily:"'Fraunces',Georgia,serif"}}>
            Invoice financing<br /><strong className="font-bold">with nothing exposed.</strong>
          </h1>
          <p className="text-[17px] text-white/70 max-w-[500px] leading-[1.75] mb-10">
            Post your invoice. Receive competing bids. Accept the best offer. Every number stays encrypted on chain — only your wallet can see your terms.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/borrower" className="bg-white text-[#c45c2e] rounded-lg px-7 py-3 text-[15px] font-bold hover:opacity-90 transition-opacity">
              Get Financing →
            </Link>
            <Link href="/lender" className="bg-transparent text-white border-2 border-white/30 rounded-lg px-7 py-3 text-[15px] font-medium hover:border-white/60 transition-colors">
              View Open Requests
            </Link>
          </div>
          {networkWarning ? (
            <p className="mt-6 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white/80 max-w-lg">
              {networkWarning}
            </p>
          ) : null}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#ede4d5]">
        {[
          { label: "Open Requests",    value: String(openCount) },
          { label: "Completed Rounds", value: String(totalCount) },
          { label: "Settlement Token", value: "bfUSD" },
          { label: "Network",          value: chainId === 11155111 ? "Sepolia" : chainId === 31337 ? "Local" : "..." },
        ].map((s, i) => (
          <div key={i} className="bg-[#fffcf7] border-r border-[#ede4d5] last:border-r-0 px-8 py-7">
            <div className="text-[34px] font-bold text-[#c45c2e] leading-none" style={{fontFamily:"'Fraunces',Georgia,serif"}}>{s.value}</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a8a7e] mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-7xl px-6 py-[72px]">
        <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#c45c2e] mb-2">Protocol Flow</div>
        <h2 className="text-[34px] font-semibold text-[#1a1208] mb-10" style={{fontFamily:"'Fraunces',Georgia,serif"}}>How BlindFactor works</h2>
        <div className="grid gap-0 md:grid-cols-3 border border-[#ede4d5] rounded-2xl overflow-hidden">
          <HowItWorksStep
            step="01"
            title="Borrower creates a request"
            body="Invoice amount and minimum payout are encrypted in your browser before the transaction fires. No plaintext ever reaches the chain."
          />
          <div className="border-l border-[#ede4d5]">
            <HowItWorksStep
              step="02"
              title="Lenders submit sealed bids"
              body="Up to three lenders bid with encrypted terms. FHE arithmetic finds the best valid offer without revealing any individual bid."
            />
          </div>
          <div className="border-l border-[#ede4d5]">
            <HowItWorksStep
              step="03"
              title="Accept, fund, and repay"
              body="The borrower decrypts the winner privately, locks the selection on-chain, and the lender funds with a confidential bfUSD transfer."
            />
          </div>
        </div>
      </section>

      {/* ── ENC STRIP ── */}
      <div className="bg-[#1a1208] flex items-center gap-4 px-6 py-5">
        <span className="w-2 h-2 rounded-full bg-[#e07043] animate-pulse flex-shrink-0" />
        <p className="text-sm text-white/65">
          <strong className="text-white">All bid amounts, invoice values, and token balances are FHE-encrypted on chain.</strong>
          {" "}Powered by Zama FHEVM — only authorized wallets can decrypt their own data.
        </p>
      </div>

      {/* ── ROLE CARDS ── */}
      <section className="mx-auto max-w-7xl px-6 py-[72px]">
        <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#c45c2e] mb-2">Choose your role</div>
        <h2 className="text-[34px] font-semibold text-[#1a1208] mb-10" style={{fontFamily:"'Fraunces',Georgia,serif"}}>Borrower or Lender?</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-[#c45c2e] text-white p-9 relative overflow-hidden">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-55 mb-3">For businesses</div>
            <h3 className="text-[26px] font-semibold mb-3" style={{fontFamily:"'Fraunces',Georgia,serif"}}>Borrow with confidence</h3>
            <p className="text-sm leading-[1.75] opacity-70 mb-7">Post your invoice financing request with encrypted terms. Let lenders compete for your business without seeing each other&apos;s bids or yours.</p>
            <Link href="/borrower" className="inline-block bg-white text-[#c45c2e] rounded-lg px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity">
              Open Borrower Desk →
            </Link>
          </div>
          <div className="rounded-2xl bg-[#f5e6d3] text-[#1a1208] border border-[#ede4d5] p-9">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-55 mb-3">For capital providers</div>
            <h3 className="text-[26px] font-semibold mb-3" style={{fontFamily:"'Fraunces',Georgia,serif"}}>Lend competitively</h3>
            <p className="text-sm leading-[1.75] opacity-70 mb-7">Browse open financing requests and submit your best sealed offer. Your terms stay private — only the protocol knows who won.</p>
            <Link href="/lender" className="inline-block bg-[#c45c2e] text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-[#8b3a1e] transition-colors">
              Open Lender Desk →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
