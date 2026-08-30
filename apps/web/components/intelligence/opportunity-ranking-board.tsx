import Link from "next/link";

import type { MarketSelection } from "@/lib/market-selection/market-selection-service";
import type { OpportunityState } from "@/lib/opportunity";

interface Props {
  marketSelection: MarketSelection;
  selected: string;
}

export function OpportunityRankingBoard({
  marketSelection,
  selected,
}: Props) {
  const best = marketSelection.bestOpportunity;

  if (!best) return null;

  const market = best.opportunity;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
          SmartPulse Scanner
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Highest Ranked Opportunity
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          The strongest institutional setup discovered in this analysis cycle.
        </p>
      </div>

      <Link
        href={`/intelligence?symbol=${encodeURIComponent(market.symbol)}`}
        className={`block rounded-xl border p-5 transition ${
          selected === market.symbol
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-700 bg-slate-950 hover:border-slate-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                1
              </span>

              <h3 className="text-xl font-semibold text-white">
                {market.symbol}
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-400">
              Direction:{" "}
              <span className="font-medium uppercase text-slate-200">
                {market.direction}
              </span>
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Source:{" "}
              <span className="font-medium text-blue-300">
                {best.source === "discovery"
                  ? "SmartPulse Discovery"
                  : "Watchlist"}
              </span>
            </p>
          </div>

          <div className="text-right">
            <Status state={market.state} />

            <p className="mt-3 text-3xl font-bold text-white">
              {best.score}
            </p>

            <p className="text-xs text-slate-500">
              Institutional Score
            </p>
          </div>
        </div>
      </Link>
    </section>
  );
}

function Status({
  state,
}: {
  state: OpportunityState;
}) {
  const style =
    state === "ready"
      ? "bg-emerald-500/15 text-emerald-400"
      : state === "forming"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-slate-700 text-slate-300";

  const label =
    state === "no_setup" ? "WAIT" : state.toUpperCase();

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}