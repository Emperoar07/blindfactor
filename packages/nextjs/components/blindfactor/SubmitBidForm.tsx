"use client";

import { FormEvent, useState } from "react";
import { SubmitBidPayload } from "~~/hooks/blindfactor/useBlindFactorMarket";

const inputClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900";

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
    <form onSubmit={handleSubmit} className="rounded-3xl border border-stone-200 bg-stone-50/90 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-stone-700">
          Payout now
          <input
            className={inputClass}
            inputMode="numeric"
            value={payoutNow}
            onChange={event => setPayoutNow(event.target.value)}
          />
        </label>
        <label className="text-sm text-stone-700">
          Repayment at due date
          <input
            className={inputClass}
            inputMode="numeric"
            value={repaymentAtDue}
            onChange={event => setRepaymentAtDue(event.target.value)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={disabled || isPending}
        className="mt-4 inline-flex items-center justify-center rounded-full border border-stone-900 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Submitting encrypted bid..." : "Submit encrypted bid"}
      </button>
    </form>
  );
};
