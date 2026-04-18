"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper";
import { useOutsideClick } from "~~/hooks/helper";

export const Header = () => {
  const pathname = usePathname();
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`relative text-sm font-semibold transition-colors ${
          active ? "text-[#e8a825]" : "text-[#fdfaf4]/70 hover:text-[#fdfaf4]"
        }`}
      >
        {label}
        {active && (
          <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#e8a825] rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0f1117]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8a825]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="#0f1117" stroke="#0f1117" strokeWidth="0.5"/>
                <path d="M7 5L9 6.5V9.5L7 11L5 9.5V6.5L7 5Z" fill="#e8a825"/>
              </svg>
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.35em] text-[#fdfaf4] group-hover:text-[#e8a825] transition-colors">
              BlindFactor
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLink("/", "Overview")}
            {navLink("/borrower", "Borrower")}
            {navLink("/lender", "Lender")}
            {navLink("/docs", "Docs")}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full bg-[#e8a825]/10 border border-[#e8a825]/25 px-3 py-1.5 sm:flex">
            <span className="bf-lock-dot" />
            <span className="text-xs font-semibold text-[#e8a825]">FHE Protected</span>
          </div>
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
