"use client";

export const StatusBadge = ({ status }: { status: string }) => {
  const className =
    status === "Funded"
      ? "bg-emerald-100 text-emerald-900 border-emerald-200"
      : status === "Repaid"
        ? "bg-sky-100 text-sky-900 border-sky-200"
        : status === "Winner Computed"
          ? "bg-amber-100 text-amber-900 border-amber-200"
          : "bg-stone-100 text-stone-900 border-stone-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${className}`}
    >
      {status}
    </span>
  );
};
