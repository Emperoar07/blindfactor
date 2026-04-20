"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { type BlindFactorDecryptItem, useBlindFactorDecryption } from "~~/hooks/blindfactor/useBlindFactorDecryption";

const DecryptValueTile = ({
  label,
  handle,
  value,
}: {
  label: string;
  handle: string;
  value: string | bigint | boolean | undefined;
}) => {
  const decrypted = typeof value !== "undefined";
  return (
    <div className={`rounded-lg border p-3.5 transition ${
      decrypted
        ? "border-[rgba(74,124,89,0.3)] bg-[rgba(74,124,89,0.06)]"
        : "border-[#ede4d5] bg-[#fdf8f2]"
    }`}>
      <p className="bf-label mb-1">{label}</p>
      <p className="font-mono text-[10px] text-[#9a8a7e] break-all leading-relaxed">
        {handle.slice(0, 18)}...{handle.slice(-6)}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {decrypted ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-[#4a7c59]" />
            <span className="text-base font-bold text-[#1a1208]">{String(value)}</span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-[#e0d5c4]" />
            <span className="text-sm text-[#9a8a7e]">Waiting for decryption</span>
          </>
        )}
      </div>
    </div>
  );
};

export const DecryptPanel = ({
  title,
  description,
  instance,
  ethersSigner,
  chainId,
  loadItems,
}: {
  title: string;
  description: string;
  instance: any;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  chainId: number | undefined;
  loadItems: () => Promise<BlindFactorDecryptItem[]>;
}) => {
  const [items, setItems] = useState<BlindFactorDecryptItem[]>([]);
  const [loadMessage, setLoadMessage] = useState("");
  const [isLoadingHandles, setIsLoadingHandles] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { canDecrypt, decrypt, isDecrypting, message, error, valuesByKey } = useBlindFactorDecryption({
    instance,
    ethersSigner,
    chainId,
    items,
  });

  const handleLoad = async () => {
    setIsLoadingHandles(true);
    setLoadError(null);
    try {
      const nextItems = await loadItems();
      setItems(nextItems);
      setLoadMessage(
        nextItems.length > 0
          ? `${nextItems.length} encrypted handle${nextItems.length > 1 ? "s" : ""} loaded for your wallet.`
          : "No decryptable values are available for this wallet on this request.",
      );
    } catch (err) {
      setLoadError(`Failed to load handles: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingHandles(false);
    }
  };

  const hasResults = items.length > 0 && Object.keys(valuesByKey).some(k => typeof valuesByKey[k] !== "undefined");

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ede4d5] bg-white">
      <div className="border-b border-[#ede4d5] bg-[#f5e6d3] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-[#1a1208]">{title}</h4>
            <p className="mt-0.5 text-xs leading-relaxed text-[#6b5b4e]">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoad}
              disabled={isLoadingHandles}
              className="bf-btn-outline text-xs px-4 py-2"
            >
              {isLoadingHandles ? "Loading..." : "Load handles"}
            </button>
            <button
              type="button"
              onClick={decrypt}
              disabled={!canDecrypt}
              className="bf-btn-gold text-xs px-4 py-2"
            >
              {isDecrypting ? "Decrypting..." : "Decrypt"}
            </button>
          </div>
        </div>

        {loadMessage && (
          <p className="mt-2 text-xs text-[#8b3a1e] bg-[rgba(196,92,46,0.08)] border border-[rgba(196,92,46,0.2)] rounded-lg px-3 py-2">
            {loadMessage}
          </p>
        )}
        {loadError && (
          <p className="mt-2 text-xs text-[#9b2c2c] bg-[#fde8e8] border border-[#f4b8b8] rounded-lg px-3 py-2">
            {loadError}
          </p>
        )}
        {message && !error && (
          <p className="mt-2 text-xs text-[#4a7c59]">{message}</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-[#9b2c2c] bg-[#fde8e8] border border-[#f4b8b8] rounded-lg px-3 py-2">
            Decryption error: {error}
          </p>
        )}
      </div>

      {items.length > 0 ? (
        <div className="px-5 py-4">
          {hasResults && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-[rgba(74,124,89,0.1)] border border-[rgba(74,124,89,0.25)] px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4a7c59]" />
              <span className="text-xs font-semibold text-[#4a7c59]">Decryption complete</span>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map(item => (
              <DecryptValueTile
                key={item.key}
                label={item.label}
                handle={item.handle}
                value={valuesByKey[item.key]}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-[#9a8a7e]">Load handles to see encrypted values for this wallet</p>
        </div>
      )}
    </div>
  );
};
