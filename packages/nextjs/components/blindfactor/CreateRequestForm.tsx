"use client";

import { FormEvent, useState } from "react";
import { CreateRequestPayload } from "~~/hooks/blindfactor/useBlindFactorMarket";

const Field = ({
  label,
  hint,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "numeric" | "text";
}) => (
  <label className="block space-y-1.5">
    <span className="bf-label">{label}</span>
    {hint && <span className="block text-xs text-[#7a6f63]">{hint}</span>}
    <input
      className="bf-input"
      inputMode={inputMode ?? "text"}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </label>
);

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
      className="overflow-hidden rounded-[1.75rem] border border-[rgba(180,165,140,0.3)] bg-white shadow-[0_4px_24px_rgba(15,17,23,0.06)]"
    >
      <div className="border-b border-[rgba(180,165,140,0.2)] bg-[#0f1117] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="bf-encrypt-badge">
              <span className="bf-lock-dot" />
              Encrypted submission
            </span>
            <h2 className="mt-3 text-2xl font-bold text-[#fdfaf4]">Create a financing request</h2>
            <p className="mt-1 text-sm text-[#fdfaf4]/60">
              Invoice amount and minimum payout are encrypted with FHE before leaving your device. No one else sees them.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Invoice amount (bfUSD)"
            hint="The face value of the invoice you are financing"
            value={invoiceAmount}
            onChange={setInvoiceAmount}
            inputMode="numeric"
          />
          <Field
            label="Minimum payout (bfUSD)"
            hint="The lowest upfront amount you will accept from a lender"
            value={minPayout}
            onChange={setMinPayout}
            inputMode="numeric"
          />
          <Field
            label="Bidding window in hours"
            hint="How long lenders have to submit encrypted bids"
            value={biddingHours}
            onChange={setBiddingHours}
            inputMode="numeric"
          />
          <Field
            label="Days until repayment"
            hint="How many days after bidding closes you will repay the lender"
            value={dueDays}
            onChange={setDueDays}
            inputMode="numeric"
          />
        </div>

        <Field
          label="Invoice reference"
          hint="A short identifier for this invoice (hashed on chain, not stored in plaintext)"
          value={invoiceRef}
          onChange={setInvoiceRef}
        />

        <div className="flex items-center justify-between gap-4 rounded-xl bg-[#fdf4dc] border border-[#f0cc80] px-4 py-3">
          <p className="text-xs text-[#7a4f00]">
            Encryption happens in your browser before the transaction is broadcast. The contract receives only FHE ciphertexts.
          </p>
        </div>

        <button
          type="submit"
          disabled={disabled || isPending}
          className="bf-btn-primary w-full"
        >
          {isPending ? "Encrypting and submitting..." : "Encrypt and create request"}
        </button>
      </div>
    </form>
  );
};
