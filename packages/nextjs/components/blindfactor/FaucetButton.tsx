"use client";

import { useFaucet } from "~~/hooks/blindfactor/useFaucet";

export const FaucetButton = () => {
  const { claim, isPending, message, error, isConnected } = useFaucet();

  return (
    <div className="rounded-2xl border border-[#ede4d5] bg-white overflow-hidden shadow-[0_4px_24px_rgba(26,18,8,0.06)]">
      <div className="border-b border-[#ede4d5] bg-[#f5e6d3] px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bf-encrypt-badge">
              <span className="bf-lock-dot" />
              Testnet Faucet
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#1a1208]">Get test bfUSD</h3>
          <p className="text-xs text-[#6b5b4e] mt-0.5">Claim 10,000 bfUSD once every 24 hours to test the protocol.</p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-2xl font-bold text-[#c45c2e]" style={{ fontFamily: "'Fraunces',Georgia,serif" }}>
            10,000
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9a8a7e]">bfUSD per claim</div>
        </div>
      </div>

      <div className="px-5 py-4 bg-[#fffcf7] space-y-3">
        {!isConnected ? (
          <p className="text-xs text-[#6b5b4e] text-center py-2">Connect your wallet to claim test tokens.</p>
        ) : (
          <button type="button" onClick={claim} disabled={isPending} className="bf-btn-primary w-full">
            {isPending ? "Claiming..." : "Claim 10,000 bfUSD"}
          </button>
        )}

        {message && (
          <p className="rounded-xl bg-[rgba(74,124,89,0.08)] border border-[rgba(74,124,89,0.25)] px-4 py-3 text-xs text-[#4a7c59] font-semibold">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-[#fde8e8] border border-[#f4b8b8] px-4 py-3 text-xs text-[#9b2c2c]">{error}</p>
        )}
      </div>
    </div>
  );
};
