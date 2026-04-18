"use client";

import { useMemo, useState } from "react";
import { DecryptPanel } from "./DecryptPanel";
import { FundingActionPanel } from "./FundingActionPanel";
import { RequestCard } from "./RequestCard";
import { SubmitBidForm } from "./SubmitBidForm";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

export const RequestDetailView = ({ requestId }: { requestId: number }) => {
  const blindFactor = useBlindFactorMarket();
  const [acceptBidId, setAcceptBidId] = useState("");

  const request = useMemo(() => blindFactor.getRequestById(requestId), [blindFactor, requestId]);

  if (!request) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8">
        <h1 className="text-3xl font-semibold text-stone-900">Request room</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          The request is not available on the currently selected network.
        </p>
      </section>
    );
  }

  const isBorrower = request.borrower.toLowerCase() === blindFactor.currentAccount?.toLowerCase();
  const isAcceptedLender = request.acceptedLender.toLowerCase() === blindFactor.currentAccount?.toLowerCase();

  return (
    <div className="space-y-6">
      {blindFactor.activityMessage ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700">
          {blindFactor.activityMessage}
        </div>
      ) : null}

      <RequestCard request={request}>
        {request.status === 0 && !isBorrower && !request.hasMyBid ? (
          <SubmitBidForm
            requestId={request.id}
            disabled={!blindFactor.hasDeployment || blindFactor.pendingAction.length > 0}
            isPending={blindFactor.pendingAction === "Submit bid"}
            onSubmit={blindFactor.submitBid}
          />
        ) : null}

        <FundingActionPanel
          acceptBidId={acceptBidId}
          onAcceptBidIdChange={setAcceptBidId}
          pendingAction={blindFactor.pendingAction}
          canClose={isBorrower && request.status === 0}
          onClose={() => blindFactor.closeBidding(request.id)}
          canAccept={
            isBorrower &&
            request.status === 2 &&
            request.acceptedLender === "0x0000000000000000000000000000000000000000"
          }
          onAccept={() => blindFactor.acceptWinningBid(request.id, Number(acceptBidId))}
          canFund={isAcceptedLender && request.status === 2}
          onFund={() => blindFactor.fundAcceptedRequest(request.id)}
          canMarkRepaid={isBorrower && request.status === 3}
          onMarkRepaid={() => blindFactor.markRepaid(request.id)}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <DecryptPanel
            title="Borrower request terms"
            description="This panel resolves only for the borrower wallet that created the request."
            instance={blindFactor.instance}
            ethersSigner={blindFactor.ethersSigner}
            chainId={blindFactor.chainId}
            loadItems={() => blindFactor.loadRequestTermsItems(request.id)}
          />
          <DecryptPanel
            title="Winning outputs"
            description="Borrower and selected lender can decrypt the winner related values they are authorized to see."
            instance={blindFactor.instance}
            ethersSigner={blindFactor.ethersSigner}
            chainId={blindFactor.chainId}
            loadItems={() => blindFactor.loadWinningItems(request.id)}
          />
        </div>

        {request.hasMyBid && typeof request.myBidId === "number" ? (
          <DecryptPanel
            title="My lender bid"
            description="This panel is available only for the lender that submitted the bid."
            instance={blindFactor.instance}
            ethersSigner={blindFactor.ethersSigner}
            chainId={blindFactor.chainId}
            loadItems={() => blindFactor.loadOwnBidItems(request.id, request.myBidId!)}
          />
        ) : null}
      </RequestCard>
    </div>
  );
};
