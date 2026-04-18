"use client";

import { FormEvent, useState } from "react";
import { CreateRequestPayload } from "~~/hooks/blindfactor/useBlindFactorMarket";

const labelClass = "text-xs font-semibold uppercase tracking-[0.25em] text-stone-500";
const inputClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900";

export const CreateRequestForm = ({
  disabled,
  isPending,
  onSubmit,
}: {
  disabled?: boolean;
  isPending?: boolean;
  onSubmit: (payload: CreateRequestPayload) => Promise<void>;
}) => {
  const [invoiceAmount, setInvoiceAmount] = useState("10000");
  const [minPayout, setMinPayout] = useState("7000");
  const [biddingHours, setBiddingHours] = useState("24");
  const [dueDays, setDueDays] = useState("30");
  const [invoiceRef, setInvoiceRef] = useState("INV BLINDFACTOR 001");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      invoiceAmount: Number(invoiceAmount),
      minPayout: Number(minPayout),
      biddingHours: Number(biddingHours),
      dueDays: Number(dueDays),
      invoiceRef,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-[0_25px_80px_rgba(50,38,18,0.08)]"
    >
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Borrower desk</p>
        <h2 className="text-3xl font-semibold text-stone-900">Create a confidential invoice financing request</h2>
        <p className="text-sm leading-6 text-stone-600">
          Borrowers publish timeline and request status while the amount and minimum acceptable payout stay encrypted.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label>
          <span className={labelClass}>Invoice amount</span>
          <input
            className={inputClass}
            inputMode="numeric"
            value={invoiceAmount}
            onChange={event => setInvoiceAmount(event.target.value)}
          />
        </label>
        <label>
          <span className={labelClass}>Minimum payout</span>
          <input
            className={inputClass}
            inputMode="numeric"
            value={minPayout}
            onChange={event => setMinPayout(event.target.value)}
          />
        </label>
        <label>
          <span className={labelClass}>Bidding window in hours</span>
          <input
            className={inputClass}
            inputMode="numeric"
            value={biddingHours}
            onChange={event => setBiddingHours(event.target.value)}
          />
        </label>
        <label>
          <span className={labelClass}>Days until repayment</span>
          <input
            className={inputClass}
            inputMode="numeric"
            value={dueDays}
            onChange={event => setDueDays(event.target.value)}
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className={labelClass}>Invoice reference</span>
        <input className={inputClass} value={invoiceRef} onChange={event => setInvoiceRef(event.target.value)} />
      </label>

      <button
        type="submit"
        disabled={disabled || isPending}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Submitting request..." : "Encrypt and create request"}
      </button>
    </form>
  );
};
