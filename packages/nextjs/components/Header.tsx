"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "~~/components/helper";
import { useOutsideClick } from "~~/hooks/helper";

/**
 * Site header
 */
export const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-[#f6efe3]/85 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold uppercase tracking-[0.35em] text-stone-900">
            BlindFactor
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-medium text-stone-600">
            <Link href="/" className="transition hover:text-stone-900">
              Overview
            </Link>
            <Link href="/borrower" className="transition hover:text-stone-900">
              Borrower
            </Link>
            <Link href="/lender" className="transition hover:text-stone-900">
              Lender
            </Link>
          </nav>
        </div>

        <div className="navbar-end grow justify-end">
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
