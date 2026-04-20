"use client";

import { DecryptPanel } from "./DecryptPanel";
import { RequestCard } from "./RequestCard";
import { SubmitBidForm } from "./SubmitBidForm";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

export const LenderDashboard = () => {
  const blindFactor = useBlindFactorMarket();

  if (!blindFactor.isConnected) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white shadow-[0_4px_24px_rgba(26,18,8,0.06)]">
        <div className="bg-[#1a1208] px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(196,92,46,0.15)] border border-[rgba(196,92,46,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="#c45c2e" strokeWidth="1.5"/>
              <path d="M12 8v4l2.5 2.5" stroke="#c45c2e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#fffcf7]" style={{fontFamily:"'Fraunces',Georgia,serif"}}>Lender desk</h1>
          <p className="mt-2 text-sm text-[#fffcf7]/60">
            Connect a lender wallet to browse open requests, submit encrypted bids, and fund selected positions.
          </p>
          <div className="mt-5 flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    );
  }

  const visibleRequests = blindFactor.requests.filter(
    request => request.borrower.toLowerCase() !== blindFactor.currentAccount?.toLowerCase(),
  );

  return (
    <div className="space-y-7">
      <div className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white shadow-[0_4px_24px_rgba(26,18,8,0.06)]">
        <div className="border-b border-[#ede4d5] bg-[#1a1208] px-6 py-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="bf-encrypt-badge">
                <span className="bf-lock-dot" />
                Private bidding
              </span>
              <h1 className="mt-3 text-2xl font-bold text-[#fffcf7]" style={{fontFamily:"'Fraunces',Georgia,serif"}}>Lender desk</h1>
              <p className="mt-1 text-sm text-[#fffcf7]/60">
                Bid privately. Compete without revealing your terms to other lenders. Fund only if the borrower selects you.
              </p>
            </div>
            <button
              type="button"
              onClick={blindFactor.refresh}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-[#fffcf7] transition hover:border-[#c45c2e] hover:text-[#c45c2e]"
            >
              Refresh desk
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <DecryptPanel
            title="Your confidential balance"
            description="Decrypt your own bfUSD balance. Only your wallet can see this value on chain."
            instance={blindFactor.instance}
            ethersSigner={blindFactor.ethersSigner}
            chainId={blindFactor.chainId}
            loadItems={() => blindFactor.loadBalanceItems()}
          />
        </div>
      </div>

      {blindFactor.activityMessage ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#ede4d5] bg-white px-5 py-3.5">
          <span className="h-2 w-2 rounded-full bg-[#c45c2e] animate-pulse" />
          <p className="text-sm text-[#1a1208]">{blindFactor.activityMessage}</p>
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <p className="bf-label">Open requests</p>
          <h2 className="mt-1 text-2xl font-bold text-[#1a1208]">Browse and bid on financing rounds</h2>
        </div>

        {blindFactor.isLoadingRequests ? (
          <div className="flex items-center gap-2 text-sm text-[#6b5b4e]">
            <span className="h-3 w-3 rounded-full border-2 border-[#c45c2e] border-t-transparent animate-spin" />
            Loading requests...
          </div>
        ) : null}

        {!blindFactor.isLoadingRequests && visibleRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ede4d5] bg-[#fdf8f2] py-14 px-6 text-center">
            <p className="text-sm font-semibold text-[#1a1208]">No requests visible</p>
            <p className="mt-1 text-sm text-[#6b5b4e]">
              Borrower requests from other wallets will appear here once created.
            </p>
          </div>
        ) : null}

        {visibleRequests.map(request => (
          <RequestCard key={request.id} request={request}>
            {request.status === 0 && !request.hasMyBid ? (
              <SubmitBidForm
                requestId={request.id}
                disabled={!blindFactor.hasDeployment || blindFactor.pendingAction.length > 0}
                isPending={blindFactor.pendingAction === "Submit bid"}
                onSubmit={blindFactor.submitBid}
              />
            ) : null}

            <div className="grid gap-4 xl:grid-cols-2">
              {request.hasMyBid && typeof request.myBidId === "number" ? (
                <DecryptPanel
                  title="My bid on this request"
                  description="Only the wallet that submitted this bid can decrypt the payout and repayment terms."
                  instance={blindFactor.instance}
                  ethersSigner={blindFactor.ethersSigner}
                  chainId={blindFactor.chainId}
                  loadItems={() => blindFactor.loadOwnBidItems(request.id, request.myBidId!)}
                />
              ) : (
                <div className="flex flex-col justify-center rounded-xl border border-dashed border-[#ede4d5] bg-[#fdf8f2] p-5">
                  <p className="text-xs font-semibold text-[#1a1208]">No bid submitted yet</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b5b4e]">
                    Submit a bid to create a private decrypt path exclusive to your wallet on this request.
                  </p>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-[#ede4d5] bg-white">
                <div className="border-b border-[#ede4d5] bg-[#f5e6d3] px-4 py-3">
                  <h4 className="text-sm font-bold text-[#1a1208]">Funding gate</h4>
                </div>
                <div className="px-4 py-4">
                  <p className="text-xs leading-relaxed text-[#6b5b4e]">
                    Funding is publicly visible as a state change, but the transfer amount comes from the encrypted winning payout. You can only fund if the borrower selected you.
                  </p>
                  {request.acceptedLender.toLowerCase() === blindFactor.currentAccount?.toLowerCase() &&
                  request.status === 2 ? (
                    <button
                      type="button"
                      onClick={() => void blindFactor.fundAcceptedRequest(request.id)}
                      className="mt-4 bf-btn-gold w-full text-sm"
                    >
                      {blindFactor.pendingAction === "Fund request" ? "Funding..." : "Fund accepted request"}
                    </button>
                  ) : (
                    <div className="mt-3 rounded-lg bg-[#fdf8f2] border border-[#ede4d5] px-3 py-2">
                      <p className="text-xs text-[#6b5b4e]">
                        {request.hasMyBid
                          ? "Waiting for the borrower to select a winner and accept."
                          : "Submit a bid to be considered for selection."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RequestCard>
        ))}
      </section>
    </div>
  );
};
