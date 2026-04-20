"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DecryptPanel } from "./DecryptPanel";
import { FundingActionPanel } from "./FundingActionPanel";
import { RequestCard } from "./RequestCard";
import { SubmitBidForm } from "./SubmitBidForm";
import { ZERO_ADDRESS } from "~~/contracts/constants";
import { useBlindFactorMarket } from "~~/hooks/blindfactor/useBlindFactorMarket";

export const RequestDetailView = ({ requestId }: { requestId: number }) => {
  const blindFactor = useBlindFactorMarket();
  const [acceptBidId, setAcceptBidId] = useState("");

  const request = useMemo(() => blindFactor.getRequestById(requestId), [blindFactor, requestId]);

  if (!request) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white shadow-[0_4px_24px_rgba(26,18,8,0.06)] p-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6b5b4e] hover:text-[#1a1208] mb-5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Back to overview
        </Link>
        <h1 className="text-2xl font-bold text-[#1a1208]" style={{fontFamily:"'Fraunces',Georgia,serif"}}>Request room</h1>
        <p className="mt-2 text-sm text-[#6b5b4e]">
          This request is not available on the currently selected network or has not loaded yet.
        </p>
        <button
          type="button"
          onClick={blindFactor.refresh}
          className="mt-4 bf-btn-primary text-sm px-5 py-2.5"
        >
          Refresh
        </button>
      </div>
    );
  }

  const isBorrower = request.borrower.toLowerCase() === blindFactor.currentAccount?.toLowerCase();
  const isAcceptedLender = request.acceptedLender.toLowerCase() === blindFactor.currentAccount?.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6b5b4e] hover:text-[#1a1208]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Back to overview
        </Link>
        <button
          type="button"
          onClick={blindFactor.refresh}
          className="bf-btn-outline text-sm px-4 py-2"
        >
          Refresh
        </button>
      </div>

      {blindFactor.activityMessage ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#ede4d5] bg-white px-5 py-3.5">
          <span className="h-2 w-2 rounded-full bg-[#c45c2e] animate-pulse" />
          <p className="text-sm text-[#1a1208]">{blindFactor.activityMessage}</p>
        </div>
      ) : null}

      {isBorrower && (
        <div className="flex items-center gap-2.5 rounded-xl bg-[rgba(196,92,46,0.07)] border border-[rgba(196,92,46,0.2)] px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c45c2e]" />
          <p className="text-xs font-semibold text-[#8b3a1e]">You are the borrower on this request</p>
        </div>
      )}

      {isAcceptedLender && (
        <div className="flex items-center gap-2.5 rounded-xl bg-[rgba(74,124,89,0.1)] border border-[rgba(74,124,89,0.25)] px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4a7c59]" />
          <p className="text-xs font-semibold text-[#4a7c59]">You are the accepted lender on this request</p>
        </div>
      )}

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
            request.acceptedLender === ZERO_ADDRESS
          }
          onAccept={() => blindFactor.acceptWinningBid(request.id, Number(acceptBidId))}
          canFund={isAcceptedLender && request.status === 2}
          onFund={() => blindFactor.fundAcceptedRequest(request.id)}
          canMarkRepaid={isBorrower && request.status === 3}
          onMarkRepaid={() => blindFactor.markRepaid(request.id)}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <DecryptPanel
            title="Request terms"
            description="Invoice amount and minimum payout. Resolves only for the borrower wallet that created this request."
            instance={blindFactor.instance}
            ethersSigner={blindFactor.ethersSigner}
            chainId={blindFactor.chainId}
            loadItems={() => blindFactor.loadRequestTermsItems(request.id)}
          />
          <DecryptPanel
            title="Winning outputs"
            description="Borrower and accepted lender can decrypt the values they are authorized to see after bidding closes."
            instance={blindFactor.instance}
            ethersSigner={blindFactor.ethersSigner}
            chainId={blindFactor.chainId}
            loadItems={() => blindFactor.loadWinningItems(request.id)}
          />
        </div>

        {request.hasMyBid && typeof request.myBidId === "number" ? (
          <DecryptPanel
            title="My lender bid"
            description="The payout now and repayment at due date that you submitted. Private to your wallet only."
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
