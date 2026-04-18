"use client";

import { useState } from "react";
import { CreateRequestForm } from "./CreateRequestForm";
import { DecryptPanel } from "./DecryptPanel";
import { FundingActionPanel } from "./FundingActionPanel";
import { RequestCard } from "./RequestCard";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

export const BorrowerDashboard = () => {
  const blindFactor = useBlindFactorMarket();
  const [acceptBidIds, setAcceptBidIds] = useState<Record<number, string>>({});

  const myRequests = blindFactor.requests.filter(
    request => request.borrower.toLowerCase() === blindFactor.currentAccount?.toLowerCase(),
  );

  if (!blindFactor.isConnected) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-3xl font-semibold text-stone-900">Borrower desk</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Connect the borrower wallet to create a request and decrypt winning results.
        </p>
        <div className="mt-6 flex justify-center">
          <RainbowKitCustomConnectButton />
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <CreateRequestForm
        disabled={!blindFactor.hasDeployment || blindFactor.pendingAction.length > 0}
        isPending={blindFactor.pendingAction === "Create request"}
        onSubmit={blindFactor.createRequest}
      />

      {blindFactor.activityMessage ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700">
          {blindFactor.activityMessage}
        </div>
      ) : null}

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Borrower requests</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900">Manage encrypted terms and winner acceptance</h2>
          </div>
          <button
            type="button"
            onClick={blindFactor.refresh}
            className="rounded-full border border-stone-900 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-stone-50"
          >
            Refresh desk
          </button>
        </div>

        {blindFactor.isLoadingRequests ? (
          <p className="text-sm text-stone-600">Loading BlindFactor requests...</p>
        ) : null}
        {myRequests.length === 0 ? (
          <p className="text-sm text-stone-600">
            No borrower requests yet. Create the first confidential financing round above.
          </p>
        ) : null}

        {myRequests.map(request => (
          <RequestCard key={request.id} request={request}>
            <FundingActionPanel
              acceptBidId={acceptBidIds[request.id] ?? ""}
              onAcceptBidIdChange={value => setAcceptBidIds(previous => ({ ...previous, [request.id]: value }))}
              pendingAction={blindFactor.pendingAction}
              canClose={request.status === 0}
              onClose={() => blindFactor.closeBidding(request.id)}
              canAccept={
                request.status === 2 && request.acceptedLender === "0x0000000000000000000000000000000000000000"
              }
              onAccept={() => blindFactor.acceptWinningBid(request.id, Number(acceptBidIds[request.id] ?? "0"))}
              canMarkRepaid={request.status === 3}
              onMarkRepaid={() => blindFactor.markRepaid(request.id)}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <DecryptPanel
                title="Borrower request terms"
                description="Load and decrypt only the borrower controlled request terms for this round."
                instance={blindFactor.instance}
                ethersSigner={blindFactor.ethersSigner}
                chainId={blindFactor.chainId}
                loadItems={() => blindFactor.loadRequestTermsItems(request.id)}
              />
              <DecryptPanel
                title="Winning outputs"
                description="Decrypt the winner after bidding closes, then use the clear bid id to accept the selected lender."
                instance={blindFactor.instance}
                ethersSigner={blindFactor.ethersSigner}
                chainId={blindFactor.chainId}
                loadItems={() => blindFactor.loadWinningItems(request.id)}
              />
            </div>
          </RequestCard>
        ))}
      </section>
    </div>
  );
};
