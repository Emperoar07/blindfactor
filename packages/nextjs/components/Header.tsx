"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper";
import { useOutsideClick } from "~~/hooks/helper";

const BalancePill = dynamic(() => import("~~/components/blindfactor/BalancePill").then(m => m.BalancePill), { ssr: false });

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
        className={`relative px-3 py-1.5 rounded-[7px] text-sm font-medium transition-all ${
          active
            ? "bg-[#f5e6d3] text-[#c45c2e] font-semibold"
            : "text-[#6b5b4e] hover:bg-[#f5e6d3] hover:text-[#1a1208]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#ede4d5] bg-[#fffcf7]">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-6 h-[62px]">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#c45c2e] border border-[rgba(232,184,109,0.35)] shadow-[0_0_0_3px_rgba(196,92,46,0.15)] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L17 7V13L10 17L3 13V7L10 3Z" stroke="#e8b86d" strokeWidth="1.2" fill="none"/>
                <path d="M10 7L14 9.5V13L10 15.5L6 13V9.5L10 7Z" fill="#e8b86d" opacity="0.9"/>
                <circle cx="10" cy="10" r="1.8" fill="#c45c2e"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[17px] tracking-[-0.01em] text-[#1a1208] group-hover:text-[#c45c2e] transition-colors" style={{fontFamily:"'Fraunces', Georgia, serif"}}>
                BlindFactor
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#9a8a7e] mt-0.5">
                Confidential Finance
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline-flex items-center rounded-full bg-[rgba(74,124,89,0.12)] border border-[rgba(74,124,89,0.3)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#4a7c59]">
            Testnet
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLink("/", "Overview")}
          {navLink("/borrower", "Borrower")}
          {navLink("/lender", "Lender")}
          {navLink("/request", "Request Room")}
          {pathname === "/" && navLink("/docs", "Docs")}
        </nav>

        {/* Pills — sit right after nav */}
        <div className="hidden items-center gap-1.5 rounded-[6px] bg-[rgba(196,92,46,0.08)] border border-[rgba(196,92,46,0.2)] px-3 py-1.5 md:flex">
          <span className="bf-lock-dot" />
          <span className="text-xs font-semibold text-[#8b3a1e]">FHE Protected</span>
        </div>
        <BalancePill />

        {/* Wallet — pushed to far right */}
        <div className="ml-auto flex-shrink-0">
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
