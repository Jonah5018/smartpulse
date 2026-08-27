import { DashboardShell } from "@/components/layout/dashboard-shell";

import {
  MarketOverviewCard,
} from "@/components/markets/market-overview-card";

import {
  requireWorkspace,
} from "@/lib/auth";

import {
  LoadMarkets,
} from "@/lib/application/markets/load-markets";

import {
  WatchlistService,
} from "@/lib/watchlist";

import {
  createClient,
} from "@/lib/supabase/server";

export default async function MarketsPage() {
  const workspace =
    await requireWorkspace();

  const client =
    await createClient();

  const watchlist =
    await WatchlistService.get(
    client,
    workspace.user.id
  );

    const market =
      await LoadMarkets.execute();

  return (
    <DashboardShell
      profile={workspace.profile}
    >
      <div className="space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            Markets
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                Market Overview
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Monitor the active SmartPulse market
                universe and current market conditions.
              </p>
            </div>

            <div
              className={
                market.session.isOpen
                  ? "rounded-full border border-emerald-900/50 bg-emerald-950/30 px-4 py-2 text-sm text-emerald-400"
                  : "rounded-full border border-red-900/50 bg-red-950/30 px-4 py-2 text-sm text-red-400"
              }
            >
              {market.session.isOpen
                ? "Market Open"
                : "Market Closed"}
            </div>
          </div>
        </section>

        {!market.session.isOpen && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
            <p className="text-lg font-semibold text-slate-200">
              Forex Market Closed
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {market.session.description}
            </p>

            {market.session.nextSessionStartsAt && (
              <p className="mt-4 text-sm text-blue-400">
                Next session:{" "}
                <span className="font-semibold">
                  {market.session.nextSession}
                </span>
              </p>
            )}
          </section>
        )}

        {!market.dataStatus.available &&
          market.session.isOpen && (
            <section className="rounded-2xl border border-amber-800/50 bg-amber-950/30 p-5">
              <p className="font-semibold text-amber-300">
                Live Market Data Unavailable
              </p>

              <p className="mt-1 text-sm text-amber-200/70">
                {market.dataStatus.message}
              </p>
            </section>
          )}

        {watchlist.length > 0 && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-semibold">
                My Watchlist
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your priority markets for SmartPulse intelligence.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {watchlist.map((symbol) => (
                <a
                  key={symbol}
                  href={`/intelligence?symbol=${encodeURIComponent(
                     symbol
                )}`}
                 className="group rounded-2xl border border-blue-900/50 bg-blue-950/20 p-5 transition hover:border-blue-600 hover:bg-blue-950/40"
             >
                 <div className="flex items-center justify-between">
                   <span className="text-lg font-semibold">
                     {symbol}
                </span>

               <span className="text-blue-400 transition group-hover:translate-x-1">
                 →
              </span>
            </div>

           <p className="mt-2 text-xs text-slate-500">
             View market intelligence
          </p>
        </a>
      ))}
    </div>
  </section>
)}

        {market.markets.length > 0 && (
            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-semibold">
                  Active Markets
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ranked according to the configured
                  SmartPulse market universe.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {market.markets.map(
                  (instrument) => (
    <MarketOverviewCard
        key={
          instrument.symbol
    }
        market={
          instrument
    }  
        marketOpen={
          market.session.isOpen
   }
        isWatched={
         watchlist.includes(
           instrument.symbol
      )
   }
/>
                  )
                )}
              </div>
            </section>
          )}
      </div>
    </DashboardShell>
  );
}