"use client";

import React from "react";
import Link from "next/link";
import { InMemoryStorageProvider } from "@fhevm-sdk";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Footer = () => (
  <footer className="border-t border-[#ede4d5] bg-[#1a1208] mt-auto">
    <div className="mx-auto max-w-7xl px-6 py-2">
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#c45c2e] border border-[rgba(232,184,109,0.35)] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L17 7V13L10 17L3 13V7L10 3Z" stroke="#e8b86d" strokeWidth="1.2" fill="none"/>
                <path d="M10 7L14 9.5V13L10 15.5L6 13V9.5L10 7Z" fill="#e8b86d" opacity="0.9"/>
                <circle cx="10" cy="10" r="1.8" fill="#c45c2e"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[16px] text-[#fffcf7]" style={{fontFamily:"'Fraunces', Georgia, serif"}}>BlindFactor</span>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#e8b86d]/60 mt-0.5">Confidential Finance</span>
            </div>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-[#fffcf7]/40">
            Confidential invoice financing on Ethereum. Built on Zama FHEVM for honest privacy boundaries and direct wallet settlement.
          </p>
        </div>

        {/* Products */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#fffcf7]/35">Products</p>
          <nav className="space-y-2">
            <Link href="/borrower" className="block text-sm text-[#fffcf7]/55 transition-colors hover:text-[#fffcf7]">Borrower desk</Link>
            <Link href="/lender" className="block text-sm text-[#fffcf7]/55 transition-colors hover:text-[#fffcf7]">Lender desk</Link>
          </nav>
        </div>

        {/* Resources */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#fffcf7]/35">Resources</p>
          <nav className="space-y-2">
            <Link href="/docs" className="block text-sm text-[#fffcf7]/55 transition-colors hover:text-[#fffcf7]">Documentation</Link>
            <a href="https://github.com/Emperoar07/blindfactor" target="_blank" rel="noopener noreferrer" className="block text-sm text-[#fffcf7]/55 transition-colors hover:text-[#fffcf7]">GitHub</a>
          </nav>
        </div>

        {/* Legal */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#fffcf7]/35">Legal</p>
          <nav className="space-y-2">
            <Link href="/docs#privacy" className="block text-sm text-[#fffcf7]/55 transition-colors hover:text-[#fffcf7]">Privacy Policy</Link>
            <Link href="/docs#cookies" className="block text-sm text-[#fffcf7]/55 transition-colors hover:text-[#fffcf7]">Cookie Policy</Link>
            <Link href="/docs#terms" className="block text-sm text-[#fffcf7]/55 transition-colors hover:text-[#fffcf7]">Terms of Use</Link>
          </nav>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        <p className="text-xs text-[#fffcf7]/30">Confidential invoice financing on Ethereum. Powered by Zama FHEVM.</p>
        <div className="flex items-center gap-4">
          <a href="https://docs.zama.ai/protocol" target="_blank" rel="noopener noreferrer" className="text-xs text-[#fffcf7]/30 transition-colors hover:text-[#e07043]">Zama Protocol</a>
          <a href="https://github.com/Emperoar07/blindfactor" target="_blank" rel="noopener noreferrer" className="text-xs text-[#fffcf7]/30 transition-colors hover:text-[#e07043]">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
);

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={lightTheme({
            accentColor: "#c45c2e",
            accentColorForeground: "#fffcf7",
            borderRadius: "medium",
          })}
        >
          <ProgressBar height="3px" color="#c45c2e" />
          <InMemoryStorageProvider>
            <div className="flex min-h-screen flex-col bg-[#fdf8f2]">
              <Header />
              <main className="relative flex flex-1 flex-col">
                {children}
              </main>
              <Footer />
            </div>
          </InMemoryStorageProvider>
          <Toaster
            toastOptions={{
              style: {
                background: "#1a1208",
                color: "#fffcf7",
                border: "1px solid rgba(237,228,213,0.2)",
                borderRadius: "0.625rem",
                fontSize: "0.875rem",
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
