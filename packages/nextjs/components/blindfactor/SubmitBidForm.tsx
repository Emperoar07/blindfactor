"use client";

import { FormEvent, useState } from "react";
import { SubmitBidPayload } from "~~/hooks/blindfactor/useBlindFactorMarket";

const MAX_UINT64 = 18_446_744_073_709_551_615n;

function validateBidForm(payoutNow: string, repaymentAtDue: string): string | null {
  const payout    = Number(payoutNow);
  const repayment = Number(repaymentAtDue);
  if (!Number.isInteger(payout) || payout <= 0) return "Payout now must be a positive whole number.";
  if (BigInt(payout) > MAX_UINT64) return "Payout now exceeds the maximum supported value.";
  if (!Number.isInteger(repayment) || repayment <= 0) return "Repayment at due date must be a positive whole number.";
  if (BigInt(repayment) > MAX_UINT64) return "Repayment exceeds the maximum supported value.";
  if (repayment <= payout) return "Repayment at due date should be greater than payout now.";
  return null;
}

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
  const [payoutNow, setPayoutNow]           = useState("8200");
  const [repaymentAtDue, setRepaymentAtDue] = useState("9000");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateBidForm(payoutNow, repaymentAtDue);
    if (error) { setValidationError(error); return; }
    setValidationError(null);
    await onSubmit({ requestId, payoutNow: Number(payoutNow), repaymentAtDue: Number(repaymentAtDue) });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white">
      <div className="flex items-center justify-between border-b border-[#ede4d5] bg-[#f5e6d3] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="bf-encrypt-badge">
            <span className="bf-lock-dot" />
            Encrypted bid
          </span>
        </div>
        <p className="text-xs text-[#6b5b4e]">Your numbers stay private from all other participants</p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 bg-[#fffcf7]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="bf-label">Payout now (bfUSD)</span>
            <p className="text-xs text-[#6b5b4e]">Amount you will send the borrower upfront</p>
            <input className="bf-input" inputMode="numeric" value={payoutNow} onChange={e => setPayoutNow(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="bf-label">Repayment at due date (bfUSD)</span>
            <p className="text-xs text-[#6b5b4e]">Amount the borrower sends back to you at maturity</p>
            <input className="bf-input" inputMode="numeric" value={repaymentAtDue} onChange={e => setRepaymentAtDue(e.target.value)} />
          </label>
        </div>

        {validationError && (
          <p className="rounded-xl bg-[#fde8e8] border border-[#f4b8b8] px-4 py-3 text-xs text-[#9b2c2c]">
            {validationError}
          </p>
        )}

        <button type="submit" disabled={disabled || isPending} className="bf-btn-primary w-full">
          {isPending ? "Encrypting and submitting bid..." : "Submit encrypted bid"}
        </button>
      </form>
    </div>
  );
};
