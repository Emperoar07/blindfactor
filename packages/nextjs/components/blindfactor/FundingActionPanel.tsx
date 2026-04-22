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

const runPanelAction = (action?: () => Promise<void>) => {
  if (!action) return;
  action().catch(error => {
    console.error("[BlindFactor] request action failed:", error);
  });
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
  const hasAnyAction = canClose || canAccept || canFund || canMarkRepaid;
  if (!hasAnyAction) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white">
      <div className="border-b border-[#ede4d5] bg-[#f5e6d3] px-5 py-3.5">
        <h4 className="text-sm font-bold text-[#1a1208]">Request actions</h4>
        <p className="text-xs leading-relaxed text-[#6b5b4e]">
          Lifecycle transitions happen here. The borrower controls closing, accepting, and repaying. The accepted lender
          controls funding.
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {canClose && (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[rgba(196,92,46,0.07)] border border-[rgba(196,92,46,0.2)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#8b3a1e]">Close bidding window</p>
              <p className="text-xs text-[#8b3a1e]/70">Only the borrower or the contract after expiry can close</p>
            </div>
            <button
              type="button"
              onClick={() => runPanelAction(onClose)}
              className="bf-btn-outline shrink-0 text-sm px-4 py-2"
            >
              {pendingAction === "Close bidding" ? "Closing..." : "Close bidding"}
            </button>
          </div>
        )}

        {canAccept && (
          <div className="space-y-3 rounded-xl bg-[#fdf8f2] border border-[#ede4d5] px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-[#1a1208]">Accept the winning lender</p>
              <p className="text-xs leading-relaxed text-[#6b5b4e]">
                Decrypt the winning bid id above, enter it here, then accept. The app submits a proof so the contract
                rejects substituted winners.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="number"
                min="0"
                step="1"
                value={acceptBidId}
                onChange={e => onAcceptBidIdChange(e.target.value)}
                placeholder="Winning bid id from decryption"
                className="bf-input flex-1"
              />
              <button
                type="button"
                onClick={() => runPanelAction(onAccept)}
                disabled={acceptBidId === "" || isNaN(Number(acceptBidId)) || Number(acceptBidId) < 0}
                className="bf-btn-gold shrink-0 text-sm px-5 py-2.5"
              >
                {pendingAction === "Accept winning bid" ? "Accepting..." : "Accept lender"}
              </button>
            </div>
          </div>
        )}

        {canFund && (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[rgba(74,124,89,0.08)] border border-[rgba(74,124,89,0.25)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#4a7c59]">Fund the borrower</p>
              <p className="text-xs text-[#4a7c59]/70">
                You have been selected. The transfer amount is encrypted, and funding is proven before the request
                becomes Funded.
              </p>
            </div>
            <button
              type="button"
              onClick={() => runPanelAction(onFund)}
              className="bf-btn-primary shrink-0 text-sm px-4 py-2"
            >
              {pendingAction === "Fund request" ? "Funding..." : "Fund request"}
            </button>
          </div>
        )}

        {canMarkRepaid && (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[#fdf8f2] border border-[#ede4d5] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#1a1208]">Mark as repaid</p>
              <p className="text-xs text-[#6b5b4e]">
                Submits the encrypted repayment transfer, then proves success before the request becomes Repaid.
              </p>
            </div>
            <button
              type="button"
              onClick={() => runPanelAction(onMarkRepaid)}
              className="bf-btn-primary shrink-0 text-sm px-4 py-2"
            >
              {pendingAction === "Mark repaid" ? "Marking..." : "Mark repaid"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
