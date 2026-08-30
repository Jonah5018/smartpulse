"use client";

import Link from "next/link";
import {
  getActiveMarketsByTier,
} from "@/lib/market/market-universe";

const groups =
  getActiveMarketsByTier();

interface Props {
  selected: string;
}

export function MarketBrowser({
  selected,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
          Market Browser
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Browse Active Markets
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          SmartPulse groups instruments by institutional priority.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([title, markets]) =>
          markets.length === 0 ? null : (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {title}
              </h3>

              <div className="flex flex-wrap gap-3">
                {markets.map((market) => (
                  <Link
                    key={market.symbol}
                    href={`/intelligence?symbol=${encodeURIComponent(
                      market.symbol
                    )}`}
                    className={`rounded-lg border px-4 py-3 transition ${
                      selected === market.symbol
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-sm font-semibold">
                      {market.symbol}
                    </div>

                    <div className="text-xs text-slate-500">
                      {market.type}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}