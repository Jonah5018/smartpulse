import Link from "next/link";

import {
  toggleWatchlist,
} from "@/lib/watchlist";

import type {
  MarketQuote,
} from "@/lib/market";

type MarketOverviewMarket =
  Omit<
    MarketQuote,
    | "bid"
    | "ask"
    | "spread"
    | "changePercent"
    | "timestamp"
  > & {
    bid: number | null;

    ask: number | null;

    price: number | null;

    spread: number | null;

    changePercent: number | null;

    timestamp: string | null;

    tier: string;

    priority: number;
  };

interface MarketOverviewCardProps {
  market: MarketOverviewMarket;

  marketOpen: boolean;

  isWatched: boolean;
}

function changeClass(
  changePercent: number | null
) {
  if (
    changePercent === null
  ) {
    return "text-slate-500";
  }

  if (
    changePercent > 0
  ) {
    return "text-emerald-400";
  }

  if (
    changePercent < 0
  ) {
    return "text-red-400";
  }

  return "text-slate-400";
}

function formatChange(
  changePercent: number | null
) {
  if (
    changePercent === null
  ) {
    return "—";
  }

  if (
    changePercent > 0
  ) {
    return `+${changePercent.toFixed(2)}%`;
  }

  return `${changePercent.toFixed(2)}%`;
}

function formatValue(
  value: number | null
) {
  if (
    value === null
  ) {
    return "—";
  }

  return value;
}

function tierLabel(
  tier: string
) {
  switch (tier) {
    case "core":
      return "Core";

    case "secondary":
      return "Secondary";

    case "extended":
      return "Extended";

    default:
      return tier;
  }
}

export function MarketOverviewCard({
  market,
  marketOpen,
  isWatched,
}: MarketOverviewCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-blue-900/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">
            {market.symbol}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {market.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form
            action={async () => {
              "use server";

              await toggleWatchlist(
                market.symbol
              );
            }}
          >
            <button
              type="submit"
              title={
                isWatched
                  ? "Remove from watchlist"
                  : "Add to watchlist"
              }
              aria-label={
                isWatched
                  ? `Remove ${market.symbol} from watchlist`
                  : `Add ${market.symbol} to watchlist`
              }
              className={
                isWatched
                  ? "flex h-8 w-8 items-center justify-center rounded-full border border-blue-700 bg-blue-950/50 text-blue-400 transition hover:border-blue-500 hover:text-blue-300"
                  : "flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-slate-500 transition hover:border-blue-700 hover:text-blue-400"
              }
            >
              {isWatched
                ? "★"
                : "☆"}
            </button>
          </form>

          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {tierLabel(
              market.tier
            )}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">
            Price
          </p>

          <p className="mt-1 font-semibold">
            {formatValue(
              market.price
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Change
          </p>

          <p
            className={`mt-1 font-semibold ${changeClass(
              market.changePercent
            )}`}
          >
            {formatChange(
              market.changePercent
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Bid
          </p>

          <p className="mt-1 font-semibold">
            {formatValue(
              market.bid
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Ask
          </p>

          <p className="mt-1 font-semibold">
            {formatValue(
              market.ask
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Spread
          </p>

          <p className="mt-1 font-semibold">
            {formatValue(
              market.spread
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            {market.timestamp
              ? `Updated ${new Date(
                  market.timestamp
                ).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}`
              : "Live quote unavailable"}
          </p>

          <span
            className={
              marketOpen
                ? "text-xs font-medium text-emerald-400"
                : "text-xs font-medium text-slate-500"
            }
          >
            {marketOpen
              ? "Live"
              : "Market Closed"}
          </span>
        </div>

        <Link
          href={`/intelligence?symbol=${encodeURIComponent(
            market.symbol
          )}`}
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-blue-800/70 bg-blue-950/30 px-4 py-2.5 text-sm font-medium text-blue-400 transition hover:border-blue-600 hover:bg-blue-900/30 hover:text-blue-300"
        >
          View Intelligence

          <span className="ml-2">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}