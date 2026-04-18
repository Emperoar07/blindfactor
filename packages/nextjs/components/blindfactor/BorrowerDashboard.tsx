"use client";

import { useState } from "react";
import { CreateRequestForm } from "./CreateRequestForm";
import { DecryptPanel } from "./DecryptPanel";
import { FundingActionPanel } from "./FundingActionPanel";
import { RequestCard } from "./RequestCard";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(180,165,140,0.4)] bg-[#fdfaf4] py-14 px-6 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf4dc]">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3v4M11 11v4M3 11h4M11 11h4" stroke="#e8a825" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="11" cy="11" r="9" stroke="#e8a825" strokeWidth="1.5"/>
      </svg>
    </div>
    <p className="text-sm font-semibold text-[#0f1117]">No requests yet</p>
    <p className="mt-1 text-sm text-[#7a6f63]">Create your first confidential financing round above to get started.</p>
  </div>
);

export const BorrowerDashboard = () => {
  const blindFactor = useBlindFactorMarket();
  const [acceptBidIds, setAcceptBidIds] = useState<Record<number, string>>({});

  const myRequests = blindFactor.requests.filter(
    request => request.borrower.toLowerCase() === blindFactor.currentAccount?.toLowerCase(),
  );

  if (!blindFactor.isConnected) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(180,165,140,0.3)] bg-white shadow-[0_4px_24px_rgba(15,17,23,0.06)]">
        <div className="bg-[#0f1117] px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8a825]/15 border border-[#e8a825]/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="11" rx="2" stroke="#e8a825" strokeWidth="1.5"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="#e8a825" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#fdfaf4]">Borrower desk</h1>
          <p className="mt-2 text-sm text-[#fdfaf4]/60">
            Connect your wallet to create confidential financing requests and manage winning bids.
          </p>
          <div className="mt-5 flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <CreateRequestForm
        disabled={!blindFactor.hasDeployment || blindFactor.pendingAction.length > 0}
        isPending={blindFactor.pendingAction === "Create request"}
        onSubmit={blindFactor.createRequest}
      />

      {blindFactor.activityMessage ? (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(180,165,140,0.3)] bg-white px-5 py-3.5">
          <span className="h-2 w-2 rounded-full bg-[#e8a825] animate-pulse" />
          <p className="text-sm text-[#0f1117]">{blindFactor.activityMessage}</p>
        </div>
      ) : null}

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="bf-label">Your requests</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0f1117]">
              Manage encrypted terms and winner acceptance
            </h2>
          </div>
          <button
            type="button"
            onClick={blindFactor.refresh}
            className="bf-btn-outline text-sm px-5 py-2.5"
          >
            Refresh desk
          </button>
        </div>

        {blindFactor.isLoadingRequests ? (
          <div className="flex items-center gap-2 text-sm text-[#7a6f63]">
            <span className="h-3 w-3 rounded-full border-2 border-[#e8a825] border-t-transparent animate-spin" />
            Loading requests...
          </div>
        ) : null}

        {!blindFactor.isLoadingRequests && myRequests.length === 0 ? (
          <EmptyState />
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
                title="Your request terms"
                description="Decrypt the invoice amount and minimum payout you submitted. Only your wallet can read these values."
                instance={blindFactor.instance}
                ethersSigner={blindFactor.ethersSigner}
                chainId={blindFactor.chainId}
                loadItems={() => blindFactor.loadRequestTermsItems(request.id)}
              />
              <DecryptPanel
                title="Winning bid outputs"
                description="Decrypt the winner after bidding closes. Use the clear bid id to accept the selected lender on chain."
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
