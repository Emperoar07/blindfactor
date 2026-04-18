"use client";

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-[#d4ede6] text-[#1a5c45] border-[#a8d9cc]",
  "Bidding Closed": "bg-[#fdf4dc] text-[#7a4f00] border-[#f0cc80]",
  "Winner Computed": "bg-[#fdf4dc] text-[#7a4f00] border-[#e8a825]",
  Funded: "bg-[#0f1117] text-[#e8a825] border-[#2a3040]",
  Repaid: "bg-[#d4ede6] text-[#1a5c45] border-[#2d7a5f]",
  Defaulted: "bg-[#f4e4e4] text-[#9b2c2c] border-[#e8b4b4]",
  Cancelled: "bg-[#f0eee9] text-[#7a6f63] border-[#ddd5c5]",
};

const STATUS_DOTS: Record<string, string> = {
  Open: "bg-[#2d7a5f]",
  "Bidding Closed": "bg-[#e8a825]",
  "Winner Computed": "bg-[#e8a825]",
  Funded: "bg-[#e8a825]",
  Repaid: "bg-[#2d7a5f]",
  Defaulted: "bg-[#9b2c2c]",
  Cancelled: "bg-[#7a6f63]",
};

export const StatusBadge = ({ status }: { status: string }) => {
  const style = STATUS_STYLES[status] ?? "bg-[#f0eee9] text-[#7a6f63] border-[#ddd5c5]";
  const dot = STATUS_DOTS[status] ?? "bg-[#7a6f63]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};
