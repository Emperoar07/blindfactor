"use client";

import { useTokenBalance } from "~~/hooks/blindfactor/useTokenBalance";

export const BalancePill = () => {
  const { balance, isDecrypting, isRevealed, reveal, isConnected } = useTokenBalance();

  if (!isConnected) return null;

  return (
    <button
      type="button"
      onClick={() => void reveal()}
      disabled={isDecrypting}
      title="Click to decrypt your bfUSD balance"
      className="hidden sm:flex items-center gap-1.5 rounded-[6px] border border-[#ede4d5] bg-[#fffcf7] px-3 py-1.5 text-xs font-semibold text-[#1a1208] hover:border-[#c45c2e] hover:text-[#c45c2e] transition-colors cursor-pointer"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9a8a7e]">bfUSD</span>
      <span className="ml-0.5">
        {isDecrypting ? "···" : balance !== null ? balance : isRevealed ? "···" : "View"}
      </span>
    </button>
  );
};
