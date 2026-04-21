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
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 h-[62px]">

        {/* Logo — Crimson Vault style */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Mark: rounded rect, dark burgundy bg, outline hex + filled inner hex */}
            <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#8b0000] border border-[rgba(232,184,109,0.3)] shadow-[0_0_0_3px_rgba(196,30,58,0.12)] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L17 7V13L10 17L3 13V7L10 3Z" stroke="#e8b86d" strokeWidth="1.2" fill="none"/>
                <path d="M10 7L14 9.5V13L10 15.5L6 13V9.5L10 7Z" fill="#e8b86d" opacity="0.85"/>
                <circle cx="10" cy="10" r="1.8" fill="#8b0000"/>
              </svg>
            </div>
            {/* Wordmark */}
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[17px] tracking-[-0.01em] text-[#1a1208] group-hover:text-[#c45c2e] transition-colors" style={{fontFamily:"'Fraunces', Georgia, serif"}}>
                BlindFactor
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#9a8a7e] mt-0.5">
                Confidential Finance
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLink("/", "Overview")}
            {navLink("/borrower", "Borrower")}
            {navLink("/lender", "Lender")}
            {navLink("/request", "Request Room")}
            {pathname === "/" && navLink("/docs", "Docs")}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-[6px] bg-[rgba(196,92,46,0.08)] border border-[rgba(196,92,46,0.2)] px-3 py-1.5 sm:flex">
            <span className="bf-lock-dot" />
            <span className="text-xs font-semibold text-[#8b3a1e]">FHE Protected</span>
          </div>
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
