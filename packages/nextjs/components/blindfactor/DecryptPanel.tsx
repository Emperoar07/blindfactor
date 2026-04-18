"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { type BlindFactorDecryptItem, useBlindFactorDecryption } from "~~/hooks/blindfactor/useBlindFactorDecryption";

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
        ? "Encrypted handles loaded for this wallet."
        : "No decryptable values are available for this wallet.",
    );
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h4 className="text-lg font-semibold text-stone-900">{title}</h4>
          <p className="text-sm leading-6 text-stone-600">{description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLoad}
            className="rounded-full border border-stone-900 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-stone-50"
          >
            Load handles
          </button>
          <button
            type="button"
            onClick={decrypt}
            disabled={!canDecrypt}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDecrypting ? "Decrypting..." : "Decrypt values"}
          </button>
        </div>
      </div>

      {loadMessage ? <p className="mt-3 text-sm text-stone-600">{loadMessage}</p> : null}
      {message ? <p className="mt-2 text-sm text-stone-600">{message}</p> : null}
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}

      {items.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {items.map(item => (
            <div key={item.key} className="rounded-3xl border border-stone-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{item.label}</p>
              <p className="mt-2 break-all font-mono text-xs text-stone-600">{item.handle}</p>
              <p className="mt-3 text-sm font-semibold text-stone-900">
                {typeof valuesByKey[item.key] === "undefined"
                  ? "Waiting for user decryption"
                  : String(valuesByKey[item.key])}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
