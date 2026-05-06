"use client";

import { useEffect } from "react";

export default function BorrowerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BorrowerDashboard] unhandled error:", error);
  }, [error]);

  const isFheError =
    error.message.toLowerCase().includes("fhe") ||
    error.message.toLowerCase().includes("encrypt") ||
    error.message.toLowerCase().includes("decrypt") ||
    error.message.toLowerCase().includes("instance");

  return (
    <div className="mx-auto w-full max-w-[900px] px-6 py-8">
      <div className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white shadow-[0_4px_24px_rgba(26,18,8,0.06)]">
        <div className="bg-[#1a1208] px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(196,92,46,0.15)] border border-[rgba(196,92,46,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01" stroke="#c45c2e" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#c45c2e" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#fffcf7]" style={{ fontFamily: "'Fraunces',Georgia,serif" }}>
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-[#fffcf7]/60">
            {isFheError
              ? "The FHE encryption layer encountered an error. Make sure your wallet is connected to Sepolia and the page has finished loading before trying again."
              : "The borrower desk ran into an unexpected error. Try refreshing or reconnecting your wallet."}
          </p>
        </div>

        <div className="bg-[#fffcf7] px-8 py-6 space-y-4">
          <div className="rounded-xl bg-[#fdf8f2] border border-[#ede4d5] px-4 py-3">
            <p className="bf-label mb-1">Error Detail</p>
            <p className="text-xs font-mono text-[#6b5b4e] break-all">
              {error.message || "Unknown error"}
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="bf-btn-primary w-full py-3"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
