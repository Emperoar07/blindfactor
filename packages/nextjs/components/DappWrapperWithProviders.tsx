"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InMemoryStorageProvider } from "@fhevm-sdk";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
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
  <footer className="border-t border-white/10 bg-[#0f1117] mt-auto">
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8a825]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="#0f1117" stroke="#0f1117" strokeWidth="0.5" />
                <path d="M7 5L9 6.5V9.5L7 11L5 9.5V6.5L7 5Z" fill="#e8a825" />
              </svg>
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.35em] text-[#fdfaf4]">BlindFactor</span>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-[#fdfaf4]/45">
            Confidential invoice financing on Ethereum. Built on Zama FHEVM for honest privacy boundaries and direct
            wallet settlement.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#fdfaf4]/40">Products</p>
          <nav className="space-y-2">
            <Link href="/borrower" className="block text-sm text-[#fdfaf4]/60 transition-colors hover:text-[#fdfaf4]">
              Borrower desk
            </Link>
            <Link href="/lender" className="block text-sm text-[#fdfaf4]/60 transition-colors hover:text-[#fdfaf4]">
              Lender desk
            </Link>
          </nav>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#fdfaf4]/40">Resources</p>
          <nav className="space-y-2">
            <Link href="/docs" className="block text-sm text-[#fdfaf4]/60 transition-colors hover:text-[#fdfaf4]">
              Documentation
            </Link>
            <a
              href="https://github.com/Emperoar07/blindfactor"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-[#fdfaf4]/60 transition-colors hover:text-[#fdfaf4]"
            >
              GitHub
            </a>
          </nav>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#fdfaf4]/40">Legal</p>
          <nav className="space-y-2">
            <Link
              href="/docs#privacy"
              className="block text-sm text-[#fdfaf4]/60 transition-colors hover:text-[#fdfaf4]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/docs#terms"
              className="block text-sm text-[#fdfaf4]/60 transition-colors hover:text-[#fdfaf4]"
            >
              Terms of Use
            </Link>
          </nav>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
        <p className="text-xs text-[#fdfaf4]/30">Confidential invoice financing on Ethereum. Powered by Zama FHEVM.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://docs.zama.ai/protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#fdfaf4]/30 transition-colors hover:text-[#e8a825]"
          >
            Zama Protocol
          </a>
          <a
            href="https://github.com/Emperoar07/blindfactor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#fdfaf4]/30 transition-colors hover:text-[#e8a825]"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ProgressBar height="3px" color="#e8a825" />
          <div className="flex min-h-screen flex-col bg-[#fdfaf4]">
            <Header />
            <main className="relative flex flex-1 flex-col">
              <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
            </main>
            <Footer />
          </div>
          <Toaster
            toastOptions={{
              style: {
                background: "#0f1117",
                color: "#fdfaf4",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
