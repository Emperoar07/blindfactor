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
    <div
      className={`rounded-xl border p-4 transition ${
        decrypted
          ? "border-[#a8d9cc] bg-[#d4ede6]/40"
          : "border-[rgba(180,165,140,0.25)] bg-[#fdfaf4]"
      }`}
    >
      <p className="bf-label mb-1">{label}</p>
      <p className="font-mono text-[10px] text-[#7a6f63] break-all leading-relaxed">
        {handle.slice(0, 18)}...{handle.slice(-6)}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {decrypted ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-[#2d7a5f]" />
            <span className="text-base font-bold text-[#0f1117]">{String(value)}</span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-[#ddd5c5]" />
            <span className="text-sm text-[#7a6f63]">Waiting for decryption</span>
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
  const { canDecrypt, decrypt, isDecrypting, message, error, valuesByKey } = useBlindFactorDecryption({
    instance,
    ethersSigner,
    chainId,
    items,
  });

  const handleLoad = async () => {
    const nextItems = await loadItems();
    setItems(nextItems);
    setLoadMessage(
      nextItems.length > 0
        ? `${nextItems.length} encrypted handle${nextItems.length > 1 ? "s" : ""} loaded for your wallet.`
        : "No decryptable values are available for this wallet on this request.",
    );
  };

  const hasResults = items.length > 0 && Object.keys(valuesByKey).some(k => typeof valuesByKey[k] !== "undefined");

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(180,165,140,0.3)] bg-white">
      <div className="border-b border-[rgba(180,165,140,0.2)] bg-[#fdfaf4] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-[#0f1117]">{title}</h4>
            <p className="mt-0.5 text-xs leading-relaxed text-[#7a6f63]">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoad}
              className="bf-btn-outline text-xs px-4 py-2"
            >
              Load handles
            </button>
            <button
              type="button"
              onClick={decrypt}
              disabled={!canDecrypt}
              className="bf-btn-primary text-xs px-4 py-2"
            >
              {isDecrypting ? "Decrypting..." : "Decrypt"}
            </button>
          </div>
        </div>

        {loadMessage && (
          <p className="mt-2 text-xs text-[#7a6f63] bg-[#fdf4dc] border border-[#f0cc80] rounded-lg px-3 py-2">
            {loadMessage}
          </p>
        )}
        {message && !error && (
          <p className="mt-2 text-xs text-[#1a5c45]">{message}</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-[#9b2c2c] bg-[#f4e4e4] border border-[#e8b4b4] rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {items.length > 0 ? (
        <div className="px-5 py-4">
          {hasResults && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#d4ede6] border border-[#a8d9cc] px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2d7a5f]" />
              <span className="text-xs font-semibold text-[#1a5c45]">Decryption complete</span>
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
          <p className="text-xs text-[#7a6f63]">Load handles to see encrypted values for this wallet</p>
        </div>
      )}
    </div>
  );
};
