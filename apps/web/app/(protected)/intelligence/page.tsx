import Link from "next/link";

import {
  DashboardShell,
} from "@/components/layout/dashboard-shell";

import {
  MarketIntelligence,
} from "@/components/dashboard/market-intelligence";

import {
  LoadMarketIntelligence,
} from "@/lib/application/intelligence/load-market-intelligence";

import {
  requireTrader,
} from "@/lib/auth";

import {
  MarketDataError,
} from "@/lib/providers/market-data";

import {
  getActiveMarketSymbols,
} from "@/lib/market/market-universe";

import {
  AIMarketBrief,
} from "@/components/intelligence/ai-market-brief";

import {
  LoadMacroIntelligence,
} from "@/lib/application/macro/load-macro-intelligence";

import {
  MacroIntelligenceCard,
} from "@/components/intelligence/macro-intelligence-card";

import {
  LiquidityHeatmapCard,
} from "@/components/liquidity";

import {
  LoadLiquidityIntelligence,
} from "@/lib/application/liquidity/load-liquidity-intelligence";

import {
  MarketRegimeCard,
} from "@/components/regime";

import {
  LoadMarketRegime,
} from "@/lib/application/regime/load-market-regime";

interface IntelligencePageProps {
  searchParams: Promise<{
    symbol?: string;
  }>;
}

export default async function IntelligencePage({
  searchParams,
}: IntelligencePageProps) {
  const {
    profile,
  } = await requireTrader();

  const params =
    await searchParams;


  /*
   * ------------------------------------------------
   * MARKET UNIVERSE
   * ------------------------------------------------
   *
   * The active SmartPulse market universe remains
   * the single source of truth for markets that can
   * be analyzed.
   */

  const allowedSymbols =
    getActiveMarketSymbols();


  /*
   * Always provide a safe fallback.
   */

  const defaultSymbol =
    allowedSymbols[0] ??
    "GBP/USD";


  const requestedSymbol =
    params.symbol?.trim() ??
    defaultSymbol;


  const symbol =
    allowedSymbols.includes(
      requestedSymbol
    )
      ? requestedSymbol
      : defaultSymbol;


  /*
   * ------------------------------------------------
   * LOAD INTELLIGENCE
   * ------------------------------------------------
   *
   * The watchlist is a preference, not a restriction.
   *
   * SmartPulse can therefore:
   *
   * 1. Analyze the requested market.
   * 2. Respect the trader's watchlist.
   * 3. Discover stronger opportunities outside it.
   */

  let intelligence:
    Awaited<
      ReturnType<
        typeof LoadMarketIntelligence.execute
      >
    > | null = null;


  let marketDataError:
    MarketDataError | null = null;


  try {
    intelligence =
      await LoadMarketIntelligence.execute(
        symbol,
        profile.favorite_markets
      );

  } catch (error) {

    if (
      error instanceof
      MarketDataError
    ) {
      marketDataError =
        error;

    } else {
      throw error;
    }
  }


  /*
   * ------------------------------------------------
   * LIVE INTELLIGENCE
   * ------------------------------------------------
   *
   * Only pass complete intelligence to the
   * MarketIntelligence component.
   *
   * Opportunity is included because it is already
   * calculated by the application layer and should
   * not be recalculated inside the UI.
   */

  const liveIntelligence =
    intelligence &&
    !intelligence.marketClosed &&
    intelligence.setup &&
    intelligence.opportunity &&
    intelligence.focus &&
    intelligence.decision

      ? {
          symbol:
            intelligence.symbol,

          setup:
            intelligence.setup,

          opportunity:
            intelligence.opportunity,

          focus:
            intelligence.focus,

          decision:
            intelligence.decision,
          
          aiBrief:
            intelligence.aiBrief,
        }

      : null;

    const macroAnalysis =
      await LoadMacroIntelligence.execute();
    const liquidityAnalysis =
      await LoadLiquidityIntelligence.execute(
        symbol,
        "15min"
    );

    const regime =
      await LoadMarketRegime.execute();

  /*
   * ------------------------------------------------
   * DISCOVERY CONTEXT
   * ------------------------------------------------
   *
   * Determine whether the currently inspected
   * market is the opportunity SmartPulse discovered
   * outside the trader's watchlist.
   */

  const selectedCandidate =
    intelligence?.marketSelection
      ?.bestOpportunity ??
    null;


  const isCurrentDiscovery =
    selectedCandidate?.source ===
      "discovery" &&
    selectedCandidate.opportunity
      .symbol ===
      intelligence?.symbol;


  /*
   * Determine whether the currently inspected
   * market is already on the trader's watchlist.
   */

  const isCurrentWatchlist =
    profile.favorite_markets
      .map(
        (market) =>
          market
            .trim()
            .toUpperCase()
      )
      .includes(
        intelligence?.symbol
          ?.trim()
          .toUpperCase() ?? ""
      );


  return (
    <DashboardShell
      profile={profile}
    >
      <div className="space-y-6">


        {/* -----------------------------------------
            PAGE HEADER
        ----------------------------------------- */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>

              <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
                SmartPulse
              </p>


              <h1 className="mt-2 text-3xl font-bold">
                Pulse Intelligence
              </h1>


              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Institutional analysis across market
                structure, liquidity, multi-timeframe
                alignment, opportunity quality and
                execution conditions.
              </p>

            </div>


            {liveIntelligence && (

              <div className="flex flex-wrap gap-2">

                {isCurrentDiscovery && (
                  <span className="rounded-full border border-blue-800/60 bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-300">
                    SmartPulse Discovery
                  </span>
                )}


                {isCurrentWatchlist && (
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300">
                    On Watchlist
                  </span>
                )}

              </div>

            )}

          </div>

        </section>


        {/* -----------------------------------------
            MARKET SELECTOR
        ----------------------------------------- */}

        <section>

          <div className="mb-3 flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Markets
              </p>


              <p className="mt-1 text-sm text-slate-400">
                Select a market to inspect its
                institutional intelligence.
              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-2">

            {allowedSymbols.map(
              (market) => (

                <Link
                  key={market}
                  href={`/intelligence?symbol=${encodeURIComponent(
                    market
                  )}`}
                  className={
                    market === symbol
                      ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                      : "rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400 transition hover:border-blue-700 hover:text-white"
                  }
                >
                  {market}
                </Link>

              )
            )}

          </div>

        </section>


        {/* -----------------------------------------
            DISCOVERY NOTICE
        ----------------------------------------- */}

        {liveIntelligence &&
          isCurrentDiscovery && (

          <section className="rounded-2xl border border-blue-900/60 bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-950 p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                  SmartPulse Discovery
                </p>


                <h2 className="mt-2 text-2xl font-semibold">
                  {liveIntelligence.symbol} deserves your attention
                </h2>


                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  This market is not currently on your
                  watchlist, but SmartPulse identified
                  a stronger opportunity here.
                </p>

              </div>


              <div className="rounded-xl border border-blue-900/50 bg-slate-950/70 px-6 py-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Discovery Score
                </p>


                <p className="mt-1 text-3xl font-bold text-blue-400">
                  {
                    selectedCandidate?.score ??
                    liveIntelligence.focus?.score ??
                    0
                  }
                </p>

              </div>

            </div>

          </section>

        )}


        {/* -----------------------------------------
            PROVIDER ERROR
        ----------------------------------------- */}

        {marketDataError ? (

          <div
            role="alert"
            className="rounded-xl border border-amber-800 bg-amber-950/30 p-6"
          >

            <div className="space-y-2">

              <h2 className="text-lg font-semibold text-amber-400">
                Live Market Data Temporarily Unavailable
              </h2>


              <p className="text-sm text-amber-200/80">
                SmartPulse could not retrieve the
                current market data for{" "}
                <span className="font-semibold text-amber-200">
                  {symbol}
                </span>
                .
              </p>


              {marketDataError.status ===
                429 ? (

                <p className="text-sm text-amber-200/80">
                  The market-data provider is
                  temporarily rate-limited.
                  SmartPulse has activated its
                  provider cooldown to prevent
                  unnecessary additional requests.
                </p>

              ) : (

                <p className="text-sm text-amber-200/80">
                  The market-data provider returned
                  a temporary error. Please try again
                  shortly.
                </p>

              )}


              <p className="pt-2 text-xs text-slate-500">
                {marketDataError.message}
              </p>

            </div>

          </div>


        ) : intelligence?.marketClosed ? (

          /* ---------------------------------------
             MARKET CLOSED
          --------------------------------------- */

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">

            <div className="space-y-4">

              <p className="text-sm uppercase tracking-[0.18em] text-blue-500">
                Market Status
              </p>


              <h2 className="text-2xl font-semibold">
                Market Closed
              </h2>


              <p className="max-w-2xl text-slate-400">
                Institutional market analysis is
                paused while the forex market is
                closed.
              </p>


              <div className="flex flex-wrap gap-6 pt-2">

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Current Session
                  </p>


                  <p className="mt-1 font-medium text-slate-200">
                    {intelligence.session.current}
                  </p>

                </div>


                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Next Session
                  </p>


                  <p className="mt-1 font-medium text-blue-400">
                    {intelligence.session.nextSession}
                  </p>

                </div>

              </div>


              {intelligence.session.nextSessionStartsAt && (

                <p className="text-sm text-slate-500">
                  Opens at{" "}
                  {new Date(
                    intelligence.session.nextSessionStartsAt
                  ).toLocaleString()}
                </p>

              )}


              <p className="pt-2 text-sm text-slate-500">
                SmartPulse will resume institutional
                analysis when the next trading session
                opens.
              </p>

            </div>

          </div>


        ) : liveIntelligence ? (

          /* ---------------------------------------
             LIVE MARKET INTELLIGENCE
          --------------------------------------- */

        <div className="space-y-6">
          <MarketIntelligence
            symbol={liveIntelligence.symbol}
            setup={liveIntelligence.setup}
            opportunity={liveIntelligence.opportunity}
            focus={liveIntelligence.focus}
            decision={liveIntelligence.decision}
         />

         <LiquidityHeatmapCard
           analysis={liquidityAnalysis}
         />

         <MarketRegimeCard
            regime={regime}
         />

          <MacroIntelligenceCard
            analysis={macroAnalysis}
         />

          <AIMarketBrief
            brief={liveIntelligence.aiBrief}
         />
      </div>

        ) : (

          /* ---------------------------------------
             NO INTELLIGENCE
          --------------------------------------- */

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">

            <h2 className="text-xl font-semibold">
              Intelligence Unavailable
            </h2>


            <p className="mt-2 text-sm text-slate-400">
              SmartPulse does not currently have
              enough market information to generate
              institutional intelligence for{" "}
              {symbol}.
            </p>

          </div>

        )}

      </div>
    </DashboardShell>
  );
}