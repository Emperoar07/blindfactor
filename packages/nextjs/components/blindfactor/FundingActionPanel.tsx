"use client";

type FundingActionPanelProps = {
  acceptBidId: string;
  onAcceptBidIdChange: (value: string) => void;
  pendingAction?: string;
  canClose?: boolean;
  onClose?: () => Promise<void>;
  canAccept?: boolean;
  onAccept?: () => Promise<void>;
  canFund?: boolean;
  onFund?: () => Promise<void>;
  canMarkRepaid?: boolean;
  onMarkRepaid?: () => Promise<void>;
};

export const FundingActionPanel = ({
  acceptBidId,
  onAcceptBidIdChange,
  pendingAction,
  canClose,
  onClose,
  canAccept,
  onAccept,
  canFund,
  onFund,
  canMarkRepaid,
  onMarkRepaid,
}: FundingActionPanelProps) => {
  return (
    <section className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
      <h4 className="text-lg font-semibold text-stone-900">Request actions</h4>
      <p className="mt-1 text-sm leading-6 text-stone-600">
        Borrowers use clear winning outputs only when they need to accept the selected lender. Funding and repayment
        remain tokenized confidential transfers.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {canClose ? (
          <button
            type="button"
            onClick={() => void onClose?.()}
            className="rounded-full border border-stone-900 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-stone-50"
          >
            {pendingAction === "Close bidding" ? "Closing..." : "Close bidding"}
          </button>
        ) : null}

        {canFund ? (
          <button
            type="button"
            onClick={() => void onFund?.()}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-50 transition hover:bg-stone-700"
          >
            {pendingAction === "Fund request" ? "Funding..." : "Fund request"}
          </button>
        ) : null}

        {canMarkRepaid ? (
          <button
            type="button"
            onClick={() => void onMarkRepaid?.()}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-50 transition hover:bg-stone-700"
          >
            {pendingAction === "Mark repaid" ? "Marking..." : "Mark repaid"}
          </button>
        ) : null}
      </div>

      {canAccept ? (
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={acceptBidId}
            onChange={event => onAcceptBidIdChange(event.target.value)}
            placeholder="Winning bid id after borrower decryption"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900"
          />
          <button
            type="button"
            onClick={() => void onAccept?.()}
            className="rounded-full border border-stone-900 px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-stone-50"
          >
            {pendingAction === "Accept winning bid" ? "Accepting..." : "Accept winning bid"}
          </button>
        </div>
      ) : null}
    </section>
  );
};
