"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

const BalancePill = dynamic(() => import("~~/components/blindfactor/BalancePill").then(m => m.BalancePill), {
  ssr: false,
});

export const Header = () => {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`relative rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all ${
          active ? "bg-[#f5e6d3] text-[#8b3a1e]" : "text-[#6b5b4e] hover:bg-[#f5e6d3] hover:text-[#1a1208]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#ede4d5] bg-[#fffcf7]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[rgba(232,184,109,0.35)] bg-[#c45c2e] shadow-[0_0_0_2px_rgba(196,92,46,0.12)]">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L17 7V13L10 17L3 13V7L10 3Z" stroke="#e8b86d" strokeWidth="1.2" fill="none" />
                <path d="M10 7L14 9.5V13L10 15.5L6 13V9.5L10 7Z" fill="#e8b86d" opacity="0.9" />
                <circle cx="10" cy="10" r="1.8" fill="#c45c2e" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-[16px] font-bold tracking-[-0.01em] text-[#1a1208] transition-colors group-hover:text-[#c45c2e]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                BlindFactor
              </span>
              <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.22em] text-[#9a8a7e]">
                Confidential Finance
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLink("/", "Overview")}
            {navLink("/borrower", "Borrower")}
            {navLink("/lender", "Lender")}
            {navLink("/request", "Request Room")}
            {pathname === "/" && navLink("/docs", "Docs")}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,124,89,0.25)] bg-[rgba(74,124,89,0.1)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4a7c59]">
              Testnet
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(196,92,46,0.18)] bg-[rgba(196,92,46,0.07)] px-2.5 py-1 text-[11px] font-bold text-[#8b3a1e]">
              <span className="bf-lock-dot" />
              FHE
            </span>
          </div>
          <BalancePill />
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
