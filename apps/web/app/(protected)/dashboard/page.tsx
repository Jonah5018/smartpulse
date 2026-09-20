import Link from "next/link";

import {
  DashboardShell,
} from "@/components/layout/dashboard-shell";

import {
  DashboardHero,
} from "@/components/dashboard/dashboard-hero";

import {
  DailyBriefingCard,
} from "@/components/dashboard/daily-briefing-card";

import {
  MarketPulseCard,
} from "@/components/dashboard/market-pulse-card";

import {
  MarketScannerCard,
} from "@/components/dashboard/market-scanner-card";

import {
  MetricCard,
} from "@/components/dashboard/metric-card";

import {
  MarketStatusCard,
} from "@/components/dashboard/market-status-card";

import {
  LoadDashboard,
} from "@/lib/application";


export default async function DashboardPage() {
  const {
    workspace,
    market,
    briefing,
  } =
    await LoadDashboard.execute();


  /*
   * ------------------------------------------------
   * OPPORTUNITY SELECTION
   * ------------------------------------------------
   *
   * SmartPulse distinguishes between:
   *
   * 1. A genuine Discovery outside the watchlist.
   * 2. The strongest opportunity from the
   *    trader's watchlist.
   *
   * Discovery takes priority only when it
   * has already passed the discovery threshold.
   */

  const discoveryOpportunity =
    market.marketSelection
      ?.bestDiscoveryOpportunity ??
    null;


  const watchedOpportunity =
    market.marketSelection
      ?.bestWatchedOpportunity ??
    null;


  /*
   * The opportunity displayed prominently
   * on the dashboard.
   *
   * A qualifying Discovery takes priority.
   * Otherwise, show the strongest watched
   * opportunity.
   */
  const selectedOpportunity =
    discoveryOpportunity ??
    watchedOpportunity ??
    null;


  const isDiscoveryOpportunity =
    discoveryOpportunity !== null;


  const bestOpportunity =
    selectedOpportunity
      ?.opportunity
      .symbol ??
    "Unavailable";


  /*
   * ------------------------------------------------
   * MARKET SUMMARY
   * ------------------------------------------------
   */

  const marketBias =
    market.pulse.trend ??
    "neutral";


  const marketSession =
    market.session.current ??
    "Unavailable";


  return (
    <DashboardShell
      profile={
        workspace.profile
      }
    >
      <div className="space-y-8">

        {/* -----------------------------------------
            DASHBOARD HERO
        ----------------------------------------- */}

        <DashboardHero
          profile={
            workspace.profile
          }

          session={
            market.session
          }
        />


        {/* -----------------------------------------
            LIVE DATA STATUS
        ----------------------------------------- */}

        {!market.dataStatus.available && (
          <div className="rounded-2xl border border-amber-800/50 bg-amber-950/30 p-5">

            <p className="font-semibold text-amber-300">
              Live Market Data Temporarily
              Unavailable
            </p>

            <p className="mt-1 text-sm text-amber-200/70">
              {
                market.dataStatus.message
              }
            </p>

          </div>
        )}


        {/* -----------------------------------------
            DAILY BRIEFING
        ----------------------------------------- */}

        <DailyBriefingCard

          focusScore={
            market.dataStatus.available
              ? briefing.focusScore
              : 0
          }


          marketSummary={
            market.dataStatus.available
              ? briefing
                  .marketSummary
                  .content
              : "Live market intelligence is temporarily unavailable."
          }


          mission={
            market.dataStatus.available
              ? briefing
                  .mission
                  .content
              : "Wait for live market data to become available before making market-based decisions."
          }


          opportunity={
            market.dataStatus.available
              ? briefing
                  .opportunity
                  .content
              : "No live opportunity is currently available."
          }


          risk={
            market.dataStatus.available
              ? briefing
                  .risk
                  .content
              : "Live market data is unavailable. Do not make decisions from stale or missing market information."
          }


          growth={
            briefing
              .growth
              .content
          }

        />


        {/* -----------------------------------------
            SMARTPULSE OPPORTUNITY / DISCOVERY
        ----------------------------------------- */}

        {market.dataStatus.available &&
          market.session.isOpen &&
          selectedOpportunity && (

          <section className="rounded-2xl border border-blue-900/60 bg-gradient-to-br from-blue-950/30 via-slate-900/80 to-slate-950 p-6">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <p className="text-sm uppercase tracking-[0.18em] text-blue-400">

                    {isDiscoveryOpportunity
                      ? "SmartPulse Discovery"
                      : "Watchlist Opportunity"}

                  </p>


                  {isDiscoveryOpportunity && (
                    <span className="rounded-full border border-blue-800/60 bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-300">
                      Outside Watchlist
                    </span>
                  )}

                </div>


                <h2 className="mt-3 text-3xl font-bold">

                  {
                    selectedOpportunity
                      .opportunity
                      .symbol
                  }

                </h2>


                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">

                  {isDiscoveryOpportunity

                    ? "SmartPulse detected a qualifying high-quality opportunity in a market that is not currently on your watchlist."

                    : "SmartPulse identified this as the strongest opportunity among the markets currently receiving your attention."}

                </p>

              </div>


              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">

                {/* QUALITY */}

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Quality
                  </p>

                  <p className="mt-1 text-lg font-semibold capitalize text-blue-400">

                    {
                      selectedOpportunity
                        .opportunity
                        .quality
                    }

                  </p>

                </div>


                {/* CONFIDENCE */}

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Confidence
                  </p>

                  <p className="mt-1 text-lg font-semibold text-emerald-400">

                    {
                      selectedOpportunity
                        .opportunity
                        .confidence
                    }%

                  </p>

                </div>


                {/* SMARTPULSE SCORE */}

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    {isDiscoveryOpportunity
                      ? "Discovery Score"
                      : "Focus Score"}

                  </p>

                  <p className="mt-1 text-lg font-semibold text-blue-400">

                    {
                      selectedOpportunity
                        .score
                    }

                  </p>

                </div>

              </div>

            </div>


            {/* SUMMARY */}

            <div className="mt-6 border-t border-slate-800 pt-5">

              <p className="text-sm text-slate-300">

                {
                  selectedOpportunity
                    .opportunity
                    .summary
                }

              </p>


              {isDiscoveryOpportunity && (
                <p className="mt-3 text-xs text-blue-400">

                  This opportunity was discovered
                  outside your current watchlist
                  and passed SmartPulse&apos;s discovery
                  threshold.

                </p>
              )}


              {/* -------------------------------------
                  INTELLIGENCE HANDOFF
              ------------------------------------- */}

              <div className="mt-5">

                <Link
                  href={`/intelligence?symbol=${encodeURIComponent(
                    selectedOpportunity
                      .opportunity
                      .symbol
                  )}`}
                  className="inline-flex items-center rounded-xl border border-blue-700 bg-blue-600/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-600 hover:text-white"
                >

                  Analyze Opportunity

                  <span className="ml-2">
                    →
                  </span>

                </Link>

              </div>

            </div>

          </section>
        )}


        {/* -----------------------------------------
            MARKET PULSE + MARKET STATUS
        ----------------------------------------- */}

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <MarketPulseCard
              pulse={
                market.pulse
              }
            />

          </div>


          <MarketStatusCard

            marketStatus={
              market.session.isOpen
                ? market.session.description
                : "Forex Market Closed"
            }


            tradingDay={
              market.session.isOpen
            }


            holiday={
              false
            }


            earlyClose={
              false
            }


            closeTime={
              null
            }

          />

        </div>


        {/* -----------------------------------------
            MARKET SCANNER
        ----------------------------------------- */}

        <MarketScannerCard

          results={
            market.marketScan
          }


          session={
            market.session
          }

        />


        {/* -----------------------------------------
            DASHBOARD METRICS
        ----------------------------------------- */}

        <div className="grid gap-6 md:grid-cols-3">

          {/* BEST OPPORTUNITY */}

          <MetricCard

            title="Best Opportunity"


            value={
              bestOpportunity
            }


            subtitle={

              market.dataStatus.available &&
              market.session.isOpen &&
              selectedOpportunity

                ? isDiscoveryOpportunity

                  ? `SmartPulse Discovery • ${selectedOpportunity.score} Score`

                  : `Watchlist Opportunity • ${selectedOpportunity.score} Score`

                : "No live opportunity while market is closed"

            }

          />


          {/* MARKET BIAS */}

          <MetricCard

            title="Market Bias"


            value={
              marketBias
            }


            subtitle={

              market.dataStatus.available &&
              market.session.isOpen

                ? market.pulse.summary

                : "Live market analysis unavailable while market is closed"

            }

          />


          {/* MARKET SESSION */}

          <MetricCard

            title="Market Session"


            value={
              marketSession
            }


            subtitle={
              market.session.description
            }

          />

        </div>

      </div>

    </DashboardShell>
  );
}
