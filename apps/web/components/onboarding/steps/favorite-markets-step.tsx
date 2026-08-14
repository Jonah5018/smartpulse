"use client";

import { useMemo, useState } from "react";

import {
  AssetClass,
  MarketService,
} from "@/lib/markets";

interface Props {
  categories: AssetClass[];
  value: string[];
  onChange: (markets: string[]) => void;
}

export function FavoriteMarketsStep({
  categories,
  value,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");

  const markets = useMemo(() => {
    return MarketService.searchMarkets(
      search,
      categories
    );
  }, [search, categories]);

  function toggle(symbol: string) {
    if (value.includes(symbol)) {
      onChange(
        value.filter((item) => item !== symbol)
      );
      return;
    }

    onChange([...value, symbol]);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">
          Favorite Markets
        </h2>

        <p className="mt-3 text-gray-400">
          Choose the markets you trade most often.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search markets..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
      />

      {markets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-400">
          No markets found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => {
            const selected =
              value.includes(market.symbol);

            return (
              <button
                key={market.symbol}
                type="button"
                onClick={() =>
                  toggle(market.symbol)
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500"
                    : "border-white/10 bg-white/5 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {market.displayName}
                  </h3>

                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs uppercase">
                    {market.assetClass}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  {market.symbol}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}