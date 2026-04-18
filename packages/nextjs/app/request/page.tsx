 "use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RequestDetailView } from "~~/components/blindfactor/RequestDetailView";

const RequestPageClient = () => {
  const searchParams = useSearchParams();
  const requestId = Number(searchParams.get("id") ?? "");

  return (
    <RequestDetailView requestId={Number.isFinite(requestId) ? requestId : NaN} />
  );
};

export default function RequestPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <Suspense fallback={null}>
        <RequestPageClient />
      </Suspense>
    </div>
  );
}
