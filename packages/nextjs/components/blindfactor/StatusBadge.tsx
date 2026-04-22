"use client";

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-[rgba(74,124,89,0.12)] text-[#4a7c59] border-[rgba(74,124,89,0.25)]",
  "Bidding Closed": "bg-[rgba(107,91,78,0.1)]  text-[#6b5b4e] border-[rgba(107,91,78,0.2)]",
  "Winner Computed": "bg-[rgba(196,92,46,0.1)]  text-[#c45c2e] border-[rgba(196,92,46,0.25)]",
  Funded: "bg-[#1a1208] text-[#e07043] border-[#2a1a0e]",
  Repaid: "bg-[rgba(74,124,89,0.18)] text-[#4a7c59] border-[rgba(74,124,89,0.3)]",
  Defaulted: "bg-[#fde8e8] text-[#9b2c2c] border-[#f4b8b8]",
  Cancelled: "bg-[#f5e6d3] text-[#9a8a7e] border-[#e0d5c4]",
  "Funding Submitted": "bg-[#1a1208] text-[#e8b86d] border-[#2a1a0e]",
  "Repayment Submitted": "bg-[rgba(196,92,46,0.1)] text-[#8b3a1e] border-[rgba(196,92,46,0.25)]",
};

const STATUS_DOTS: Record<string, string> = {
  Open: "bg-[#4a7c59]",
  "Bidding Closed": "bg-[#9a8a7e]",
  "Winner Computed": "bg-[#c45c2e]",
  Funded: "bg-[#e07043]",
  Repaid: "bg-[#4a7c59]",
  Defaulted: "bg-[#9b2c2c]",
  Cancelled: "bg-[#9a8a7e]",
  "Funding Submitted": "bg-[#e8b86d]",
  "Repayment Submitted": "bg-[#c45c2e]",
};

export const StatusBadge = ({ status }: { status: string }) => {
  const style = STATUS_STYLES[status] ?? "bg-[#f5e6d3] text-[#9a8a7e] border-[#e0d5c4]";
  const dot = STATUS_DOTS[status] ?? "bg-[#9a8a7e]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};
