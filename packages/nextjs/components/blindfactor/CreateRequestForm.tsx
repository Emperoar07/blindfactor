"use client";

import { FormEvent, useState } from "react";
import { CreateRequestPayload } from "~~/hooks/blindfactor/useBlindFactorMarket";

const MAX_UINT64 = 18_446_744_073_709_551_615n;

function validateRequestForm(
  invoiceAmount: string,
  minPayout: string,
  biddingHours: string,
  dueDays: string,
  invoiceRef: string,
): string | null {
  const invoice = Number(invoiceAmount);
  const payout  = Number(minPayout);
  const hours   = Number(biddingHours);
  const days    = Number(dueDays);
  if (!Number.isInteger(invoice) || invoice <= 0) return "Invoice amount must be a positive whole number.";
  if (BigInt(invoice) > MAX_UINT64) return "Invoice amount exceeds the maximum supported value.";
  if (!Number.isInteger(payout) || payout <= 0) return "Minimum payout must be a positive whole number.";
  if (payout > invoice) return "Minimum payout cannot exceed the invoice amount.";
  if (!Number.isInteger(hours) || hours <= 0) return "Bidding window must be at least 1 hour.";
  if (!Number.isInteger(days) || days <= 0) return "Days until repayment must be at least 1.";
  if (!invoiceRef.trim()) return "Invoice reference cannot be empty.";
  return null;
}

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
    {hint && <span className="block text-xs text-[#6b5b4e]">{hint}</span>}
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
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [minPayout, setMinPayout]         = useState("");
  const [biddingHours, setBiddingHours]   = useState("");
  const [dueDays, setDueDays]             = useState("");
  const [invoiceRef, setInvoiceRef]       = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateRequestForm(invoiceAmount, minPayout, biddingHours, dueDays, invoiceRef);
    if (error) { setValidationError(error); return; }
    setValidationError(null);
    await onSubmit({
      invoiceAmount: Number(invoiceAmount),
      minPayout:     Number(minPayout),
      biddingHours:  Number(biddingHours),
      dueDays:       Number(dueDays),
      invoiceRef,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white shadow-[0_4px_24px_rgba(26,18,8,0.06)]"
    >
      {/* Header — dark ink matching Terra Clay preview */}
      <div className="border-b border-[#ede4d5] bg-[#1a1208] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="bf-encrypt-badge">
              <span className="bf-lock-dot" />
              Encrypted submission
            </span>
            <h2 className="mt-3 text-xl font-semibold text-[#fffcf7]" style={{fontFamily:"'Fraunces',Georgia,serif"}}>
              Create a financing request
            </h2>
            <p className="mt-1 text-sm text-[#fffcf7]/55">
              Invoice amount and minimum payout are encrypted with FHE before leaving your device.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5 bg-[#fffcf7]">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Invoice amount (bfUSD)" hint="The face value of the invoice you are financing" value={invoiceAmount} onChange={setInvoiceAmount} inputMode="numeric" />
          <Field label="Minimum payout (bfUSD)" hint="The lowest upfront amount you will accept from a lender" value={minPayout} onChange={setMinPayout} inputMode="numeric" />
          <Field label="Bidding window in hours" hint="How long lenders have to submit encrypted bids" value={biddingHours} onChange={setBiddingHours} inputMode="numeric" />
          <Field label="Days until repayment" hint="How many days after bidding closes you will repay the lender" value={dueDays} onChange={setDueDays} inputMode="numeric" />
        </div>

        <Field label="Invoice reference" hint="A short identifier for this invoice (hashed on chain, not stored in plaintext)" value={invoiceRef} onChange={setInvoiceRef} />

        <div className="flex items-center gap-3 rounded-xl bg-[rgba(196,92,46,0.07)] border border-[rgba(196,92,46,0.18)] px-4 py-3">
          <p className="text-xs text-[#8b3a1e]">
            Encryption happens in your browser before the transaction is broadcast. The contract receives only FHE ciphertexts.
          </p>
        </div>

        {validationError && (
          <p className="rounded-xl bg-[#fde8e8] border border-[#f4b8b8] px-4 py-3 text-xs text-[#9b2c2c]">
            {validationError}
          </p>
        )}

        <button type="submit" disabled={disabled || isPending} className="bf-btn-gold w-full py-3">
          {isPending ? "Encrypting and submitting..." : "Encrypt and create request"}
        </button>
      </div>
    </form>
  );
};
