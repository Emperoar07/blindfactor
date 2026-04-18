"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { BlindFactorRequest } from "~~/hooks/blindfactor/useBlindFactorMarket";

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000));

const shortAddress = (value: string) =>
  value && value !== "0x0000000000000000000000000000000000000000"
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : "None";

export const RequestCard = ({ request, children }: { request: BlindFactorRequest; children?: ReactNode }) => {
  return (
    <article className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-[0_25px_80px_rgba(50,38,18,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Request #{request.id}
            </span>
            <StatusBadge status={request.statusLabel} />
          </div>
          <h3 className="text-2xl font-semibold text-stone-900">Confidential invoice financing round</h3>
          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            BlindFactor keeps workflow state public and financial terms encrypted so lenders can bid without public
            leakage.
          </p>
        </div>

        <Link
          href={`/requests/${request.id}`}
          className="inline-flex items-center justify-center rounded-full border border-stone-900 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-stone-50"
        >
          Open request room
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-stone-50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Borrower</p>
          <p className="mt-2 font-mono text-sm text-stone-900">{shortAddress(request.borrower)}</p>
        </div>
        <div className="rounded-3xl bg-stone-50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Bidding ends</p>
          <p className="mt-2 text-sm font-semibold text-stone-900">{formatDate(request.biddingEndsAt)}</p>
        </div>
        <div className="rounded-3xl bg-stone-50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Due date</p>
          <p className="mt-2 text-sm font-semibold text-stone-900">{formatDate(request.dueAt)}</p>
        </div>
        <div className="rounded-3xl bg-stone-50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Bid count</p>
          <p className="mt-2 text-sm font-semibold text-stone-900">{request.bidCount} / 3</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-stone-50/70 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Invoice reference hash</p>
          <p className="mt-2 break-all font-mono text-xs text-stone-700">{request.invoiceRefHash}</p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-stone-50/70 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Accepted lender</p>
          <p className="mt-2 font-mono text-sm text-stone-700">{shortAddress(request.acceptedLender)}</p>
        </div>
      </div>

      {children ? <div className="mt-6 space-y-4">{children}</div> : null}
    </article>
  );
};
