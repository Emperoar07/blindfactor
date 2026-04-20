"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { BlindFactorRequest } from "~~/hooks/blindfactor/useBlindFactorMarket";

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));

const shortAddress = (value: string) =>
  value && value !== "0x0000000000000000000000000000000000000000"
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : "None";

const MetaTile = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="bf-stat-tile">
    <p className="bf-label mb-1.5">{label}</p>
    <p className={`text-sm font-semibold text-[#1a1208] ${mono ? "font-mono" : ""}`}>{value}</p>
  </div>
);

export const RequestCard = ({ request, children }: { request: BlindFactorRequest; children?: ReactNode }) => {
  const isExpired = request.biddingEndsAt < Math.floor(Date.now() / 1000);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white shadow-[0_4px_24px_rgba(26,18,8,0.06)]">
      <div className="border-b border-[#ede4d5] bg-[#f5e6d3] px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bf-label">Request #{request.id}</span>
              <StatusBadge status={request.statusLabel} />
              {request.hasMyBid && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(74,124,89,0.12)] border border-[rgba(74,124,89,0.3)] px-2.5 py-0.5 text-xs font-bold text-[#4a7c59]">
                  My bid placed
                </span>
              )}
              {isExpired && request.status === 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fde8e8] border border-[#f4b8b8] px-2.5 py-0.5 text-xs font-bold text-[#9b2c2c]">
                  Bidding expired
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-[#1a1208]">Confidential invoice financing round</h3>
            <p className="text-sm leading-relaxed text-[#6b5b4e]">
              Workflow state is public. Invoice value, minimum payout, and all bid figures stay encrypted until the authorized wallet decrypts them.
            </p>
          </div>

          <Link href={`/request?id=${request.id}`} className="bf-btn-outline shrink-0 text-sm">
            Open room
          </Link>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <MetaTile label="Borrower" value={shortAddress(request.borrower)} mono />
          <MetaTile label="Bidding ends" value={formatDate(request.biddingEndsAt)} />
          <MetaTile label="Due date" value={formatDate(request.dueAt)} />
          <MetaTile label="Bids" value={`${request.bidCount} of 3`} />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="bf-stat-tile">
            <p className="bf-label mb-1.5">Invoice reference hash</p>
            <p className="break-all font-mono text-xs text-[#6b5b4e]">{request.invoiceRefHash}</p>
          </div>
          <div className="bf-stat-tile">
            <p className="bf-label mb-1.5">Accepted lender</p>
            <p className="font-mono text-sm font-semibold text-[#1a1208]">{shortAddress(request.acceptedLender)}</p>
          </div>
        </div>
      </div>

      {children ? (
        <div className="border-t border-[#ede4d5] bg-[#fdf8f2] px-6 py-5 space-y-4">
          {children}
        </div>
      ) : null}
    </article>
  );
};
