"use client";

import { FormEvent, useState } from "react";
import { SubmitBidPayload } from "~~/hooks/blindfactor/useBlindFactorMarket";

export const SubmitBidForm = ({
  requestId,
  disabled,
  isPending,
  onSubmit,
}: {
  requestId: number;
  disabled?: boolean;
  isPending?: boolean;
  onSubmit: (payload: SubmitBidPayload) => Promise<void>;
}) => {
  const [payoutNow, setPayoutNow] = useState("8200");
  const [repaymentAtDue, setRepaymentAtDue] = useState("9000");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      requestId,
      payoutNow: Number(payoutNow),
      repaymentAtDue: Number(repaymentAtDue),
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(180,165,140,0.3)] bg-white">
      <div className="flex items-center justify-between border-b border-[rgba(180,165,140,0.2)] bg-[#fdfaf4] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="bf-encrypt-badge">
            <span className="bf-lock-dot" />
            Encrypted bid
          </span>
        </div>
        <p className="text-xs text-[#7a6f63]">Your numbers stay private from all other participants</p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="bf-label">Payout now (bfUSD)</span>
            <p className="text-xs text-[#7a6f63]">Amount you will send the borrower upfront</p>
            <input
              className="bf-input"
              inputMode="numeric"
              value={payoutNow}
              onChange={e => setPayoutNow(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="bf-label">Repayment at due date (bfUSD)</span>
            <p className="text-xs text-[#7a6f63]">Amount the borrower sends back to you at maturity</p>
            <input
              className="bf-input"
              inputMode="numeric"
              value={repaymentAtDue}
              onChange={e => setRepaymentAtDue(e.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={disabled || isPending}
          className="bf-btn-primary w-full"
        >
          {isPending ? "Encrypting and submitting bid..." : "Submit encrypted bid"}
        </button>
      </form>
    </div>
  );
};
