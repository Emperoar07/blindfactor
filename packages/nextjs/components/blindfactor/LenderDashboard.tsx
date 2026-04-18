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
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-3xl font-semibold text-stone-900">Lender desk</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Connect a lender wallet to submit encrypted bids and fund a selected request.
        </p>
        <div className="mt-6 flex justify-center">
          <RainbowKitCustomConnectButton />
        </div>
      </section>
    );
  }

  const visibleRequests = blindFactor.requests.filter(
    request => request.borrower.toLowerCase() !== blindFactor.currentAccount?.toLowerCase(),
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_25px_80px_rgba(50,38,18,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Lender liquidity</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">Bid privately and fund only if selected</h1>
          </div>
          <button
            type="button"
            onClick={blindFactor.refresh}
            className="rounded-full border border-stone-900 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-stone-50"
          >
            Refresh desk
          </button>
        </div>

        <div className="mt-5">
          <DecryptPanel
            title="Confidential settlement balance"
            description="The lender can decrypt only their own bfUSD balance before bidding or funding."
            instance={blindFactor.instance}
            ethersSigner={blindFactor.ethersSigner}
            chainId={blindFactor.chainId}
            loadItems={() => blindFactor.loadBalanceItems()}
          />
        </div>
      </section>

      {blindFactor.activityMessage ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700">
          {blindFactor.activityMessage}
        </div>
      ) : null}

      <section className="space-y-5">
        {visibleRequests.length === 0 ? (
          <p className="text-sm text-stone-600">No borrower requests are currently visible to this lender wallet.</p>
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
                  title="My encrypted bid"
                  description="Only the bidding lender can decrypt the bid they submitted to this request."
                  instance={blindFactor.instance}
                  ethersSigner={blindFactor.ethersSigner}
                  chainId={blindFactor.chainId}
                  loadItems={() => blindFactor.loadOwnBidItems(request.id, request.myBidId!)}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50/60 p-5 text-sm leading-7 text-stone-600">
                  Submit a bid to create a lender only decrypt path for this request.
                </div>
              )}

              <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-5">
                <h4 className="text-lg font-semibold text-stone-900">Funding gate</h4>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Funding is public as a state change, but the transfer amount comes from the encrypted winning payout.
                </p>
                {request.acceptedLender.toLowerCase() === blindFactor.currentAccount?.toLowerCase() &&
                request.status === 2 ? (
                  <button
                    type="button"
                    onClick={() => void blindFactor.fundAcceptedRequest(request.id)}
                    className="mt-4 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-700"
                  >
                    {blindFactor.pendingAction === "Fund request" ? "Funding..." : "Fund accepted request"}
                  </button>
                ) : (
                  <p className="mt-4 text-sm text-stone-600">
                    This lender can fund only if selected and publicly accepted by the borrower.
                  </p>
                )}
              </div>
            </div>
          </RequestCard>
        ))}
      </section>
    </div>
  );
};
