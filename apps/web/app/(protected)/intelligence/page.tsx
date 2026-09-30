import type { ReactNode } from "react";

import { PriceActionCard } from "@/components/intelligence/price-action-card";

import Link from "next/link";

import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import {
  DashboardShell,
} from "@/components/layout/dashboard-shell";

import {
  PageHeading,
} from "@/components/workspace/page-heading";

import {
  MarketIntelligence,
} from "@/components/dashboard/market-intelligence";

import {
  AIMarketBrief,
} from "@/components/intelligence/ai-market-brief";

import {
  MacroIntelligenceCard,
} from "@/components/intelligence/macro-intelligence-card";

import {
  TopDownAnalysisCard,
} from "@/components/intelligence/top-down-analysis-card";

import {
  InstitutionalSnapshotCard,
} from "@/components/intelligence/institutional-snapshot-card";

import {
  ExecutionChecklistCard,
} from "@/components/intelligence/execution-checklist-card";

import {
  MarketStructureTimeline,
} from "@/components/intelligence/market-structure-timeline";

import {
  AIInstitutionalMentorCard,
} from "@/components/intelligence/ai-institutional-mentor-card";

import {
  OpportunityRankingBoard,
} from "@/components/intelligence/opportunity-ranking-board";

import {
  AITradeJournalCard,
} from "@/components/intelligence/ai-trade-journal-card";

import {
  AnalysisFreshness,
} from "@/components/intelligence/analysis-freshness";

import {
  LiquidityLadderCard,
} from "@/components/liquidity";

import {
  MarketRegimeCard,
} from "@/components/regime";

import {
  ConfluenceMatrixCard,
} from "@/components/confluence";

import {
  LoadProtectedMarketIntelligence,
} from "@/lib/application/intelligence/load-protected-market-intelligence";

import {
  EntitlementAccessError,
} from "@/lib/billing/access";

import {
  requireTrader,
} from "@/lib/auth";

import {
  MarketDataError,
} from "@/lib/providers/market-data";

import {
  getActiveMarketGroups,
  getActiveMarketSymbols,
  normalizeMarketSymbol,
} from "@/lib/market/market-universe";

interface EvidenceProps {
  title: string;
  description: string;
  children: ReactNode;
}

interface IntelligencePageProps {
  searchParams: Promise<{
    symbol?: string | string[];
  }>;
}

function Evidence({
  title,
  description,
  children,
}: EvidenceProps) {
  return (
    <details className="sp-disclosure">
      <summary>
        <span>
          {title}
        </span>

        <span className="mt-1 block pl-4 text-xs font-normal text-slate-500">
          {description}
        </span>
      </summary>

      <div className="space-y-5 p-3 sm:p-5">
        {children}
      </div>
    </details>
  );
}

export default async function IntelligencePage({
  searchParams,
}: IntelligencePageProps) {
  const {
    profile,
  } = await requireTrader();

  const params =
    await searchParams;

  const allowedSymbols =
    getActiveMarketSymbols();

  const requestedSymbol =
    normalizeMarketSymbol(
      (
        Array.isArray(
          params.symbol
        )
          ? params.symbol[0]
          : params.symbol
      ) ?? ""
    );

  // Explicitly requested invalid markets must not silently become GBP/USD.
  const symbol = requestedSymbol || allowedSymbols[0] || "GBP/USD";

  let intelligence:
    Awaited<
      ReturnType<
        typeof LoadProtectedMarketIntelligence.execute
      >
    > | null = null;

  let marketDataError:
    MarketDataError | null =
    null;

  let accessError:
    EntitlementAccessError | null =
    null;

  try {
    intelligence =
      await LoadProtectedMarketIntelligence.execute(
        symbol,
        profile.favorite_markets
      );
  } catch (caught) {
    if (
      caught instanceof
      EntitlementAccessError
    ) {
      accessError =
        caught;
    } else if (
      caught instanceof
      MarketDataError
    ) {
      marketDataError =
        caught;
    } else {
      throw caught;
    }
  }

  const setup =
    intelligence?.setup ??
    null;

  const journal =
    intelligence?.tradeJournal ??
    null;

  const live =
    Boolean(
      intelligence &&
        !intelligence.marketClosed &&
        setup &&
        journal &&
        intelligence.decision &&
        intelligence.opportunity
    );

  const watched =
    profile.favorite_markets
      .map(
        normalizeMarketSymbol
      )
      .includes(
        symbol
      );

  return (
    <DashboardShell
      profile={profile}
    >
      <div className="space-y-7">
        <PageHeading
          eyebrow="Your research desk"
          title="Pulse Intelligence"
          description="Start with the market story. Check the evidence. Decide what deserves your attention."
          actions={
            <Link
              className="sp-button-secondary"
              href="/journal"
            >
              <BookOpen
                size={16}
              />

              Trading journal
            </Link>
          }
        />

        {!accessError && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Select market" className="w-full space-y-3">
              {Object.entries(getActiveMarketGroups()).map(([group, markets]) => (
                <div key={group} className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {markets.map(market => (
                      <Link
                        key={market.id}
                        aria-current={market.symbol === symbol ? "page" : undefined}
                        href={"/intelligence?symbol=" + encodeURIComponent(market.symbol)}
                        className={market.symbol === symbol ? "sp-button-primary" : "sp-button-secondary"}
                      >
                        {market.symbol}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <Link
              href="/watchlist"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-300"
            >
              Manage watchlist

              <ChevronRight
                size={14}
              />
            </Link>
          </div>
        )}

        {accessError ? (
          <section
            role="status"
            className="sp-panel"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Pulse Intelligence
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-slate-100">
                Full Pulse Intelligence requires Pro access
              </h2>

              {accessError.entitlement
                .trialExpired ? (
                <>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Your Pro trial has ended.
                    Full multi-timeframe
                    institutional analysis is
                    no longer available on
                    your current access level.
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Your profile, preferences,
                    trading journal, and saved
                    account data remain
                    available.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Full H4, H1, and M15
                    institutional analysis is
                    available with Pro and
                    Elite access.
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Your current account
                    remains active, and your
                    existing data has not been
                    deleted or changed.
                  </p>
                </>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="sp-panel !bg-gradient-to-br from-blue-950/40 via-slate-900/50 to-slate-950">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-tight">
                      {symbol}
                    </h2>

                    {watched && (
                      <span className="sp-badge">
                        On watchlist
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    H4 context

                    <span className="px-2 text-slate-600">
                      /
                    </span>

                    H1 structure

                    <span className="px-2 text-slate-600">
                      /
                    </span>

                    M15 execution
                  </p>
                </div>

                {journal && (
                  <Link
                    className="sp-button-primary"
                    href={`/journal/new?symbol=${encodeURIComponent(
                      symbol
                    )}&capture=1`}
                  >
                    <BookOpen
                      size={16}
                    />

                    Save to journal

                    <ArrowUpRight
                      size={15}
                    />
                  </Link>
                )}
              </div>

              {intelligence &&
                live &&
                setup && (
                  <>
                    <div className="my-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        [
                          "Setup",
                          setup.state.replaceAll(
                            "_",
                            " "
                          ),
                        ],
                        [
                          "Direction",
                          setup.direction,
                        ],
                        [
                          "Focus score",
                          intelligence.focus
                            ? `${intelligence.focus.score} / 100`
                            : "Unavailable",
                        ],
                        [
                          "Next action",
                          intelligence.decision
                            ? intelligence.decision.action.replaceAll(
                                "_",
                                " "
                              )
                            : "Unavailable",
                        ],
                      ].map(
                        ([
                          label,
                          value,
                        ]) => (
                          <div
                            key={label}
                            className="min-w-0 border-l-2 border-blue-500/30 pl-4"
                          >
                            <p className="text-xs text-slate-500">
                              {label}
                            </p>

                            <p className="mt-2 text-lg font-semibold capitalize text-slate-100">
                              {value}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    {intelligence.decision && (
                      <p className="mb-5 max-w-4xl text-sm leading-7 text-slate-300">
                        {
                          intelligence
                            .decision
                            .message
                        }
                      </p>
                    )}

                    <p className="mb-5 text-xs text-slate-500">
                      A setup is an
                      observation. Recording
                      an entry does not execute
                      a trade.
                    </p>
                  </>
                )}

              <div className="mt-5">
                <AnalysisFreshness
                  generatedAt={
                    intelligence
                      ?.generatedAt ??
                    null
                  }
                  historical={
                    intelligence
                      ?.marketClosed ??
                    false
                  }
                />
              </div>
            </section>

            {marketDataError ? (
              <section
                role="alert"
                className="sp-notice"
              >
                <h2 className="font-semibold">
                  Live Market Data Temporarily Unavailable
                </h2>

                <p className="mt-2">
                  {marketDataError.status ===
                  429
                    ? "The data provider is temporarily rate-limited. Wait a moment before refreshing."
                    : "We couldn't retrieve this market's current analysis. Try refreshing shortly."}
                </p>

                <p className="mt-2">
                  Your saved journal remains
                  available.
                </p>
              </section>
            ) : intelligence
                ?.marketClosed ? (
              <div className="space-y-5">
                <section className="sp-panel">
                  <h2 className="text-xl font-semibold">
                    Market closed
                  </h2>

                  <p className="mt-3 text-sm text-slate-400">
                    {
                      intelligence
                        .marketAvailability
                        .reason
                    }
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    Next session:{" "}
                    {
                      intelligence
                        .session
                        .nextSession
                    }
                    . Any analysis below is
                    a historical study
                    snapshot.
                  </p>
                </section>

                {setup && (
                  <Evidence
                    title="Historical market study"
                    description="Previously generated analysis; not a current opportunity"
                  >
                    <InstitutionalSnapshotCard
                      setup={setup}
                      symbol={symbol}
                    />

                    {journal && (
                      <AITradeJournalCard
                        journal={
                          journal
                        }
                      />
                    )}
                  </Evidence>
                )}
              </div>
            ) : intelligence &&
              live &&
              setup &&
              journal &&
              intelligence.decision &&
              intelligence.opportunity ? (
              <>
                {intelligence
                  .unavailableSections
                  .length > 0 && (
                  <p
                    role="status"
                    className="sp-notice"
                  >
                    Temporarily unavailable:{" "}
                    {intelligence.unavailableSections.join(
                      ", "
                    )}
                    . Available analysis
                    remains below.
                  </p>
                )}

                <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_1fr]">
                  <ExecutionChecklistCard
                    setup={setup}
                  />

                  <AIMarketBrief
                    brief={
                      intelligence.aiBrief
                    }
                    fallback={
                      journal.narrative
                    }
                  />
                </div>

                <section className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Explore the evidence
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Open the detail you
                        need, without losing
                        the overall picture.
                      </p>
                    </div>

                    <span className="text-xs text-slate-500">
                      Six research sections
                    </span>
                  </div>

                  <Evidence
                    title="01 · Structure & price delivery"
                    description="Top-down analysis, market sequence and liquidity"
                  >
                    {setup.priceAction && (
                      <PriceActionCard
                        analysis={setup.priceAction}
                        beginner={profile.learning_mode === "learning"}
                      />
                    )}

                    <TopDownAnalysisCard
                      setup={setup}
                    />

                    <MarketStructureTimeline
                      setup={setup}
                    />

                    {intelligence.liquidityAnalysis && (
                      <LiquidityLadderCard
                        analysis={
                          intelligence
                            .liquidityAnalysis
                        }
                      />
                    )}
                  </Evidence>

                  <Evidence
                    title="02 · Setup assessment"
                    description="The generated checklist, risk plan and coaching lesson"
                  >
                    <AITradeJournalCard
                      journal={
                        journal
                      }
                    />
                  </Evidence>

                  <Evidence
                    title="03 · Scores & decision reasoning"
                    description="Understand the opportunity, focus score and final decision"
                  >
                    {intelligence.confluence && (
                      <ConfluenceMatrixCard
                        matrix={
                          intelligence
                            .confluence
                        }
                      />
                    )}

                    {intelligence.focus ? (
                      <MarketIntelligence
                        symbol={symbol}
                        setup={setup}
                        opportunity={
                          intelligence
                            .opportunity
                        }
                        focus={
                          intelligence.focus
                        }
                        decision={
                          intelligence
                            .decision
                        }
                      />
                    ) : (
                      <p className="sp-notice">
                        Focus score is
                        currently unavailable.
                      </p>
                    )}
                  </Evidence>

                  <Evidence
                    title="04 · Macro & market regime"
                    description="Calendar context and the limits of available evidence"
                  >
                    <p className="text-xs text-slate-500">
                      Calendar notices:
                      FinCal. Missing release
                      data does not establish
                      a directional outlook.
                    </p>

                    {intelligence.macroAnalysis && (
                      <MacroIntelligenceCard
                        analysis={
                          intelligence
                            .macroAnalysis
                        }
                      />
                    )}

                    {intelligence.regime && (
                      <MarketRegimeCard
                        regime={
                          intelligence
                            .regime
                        }
                      />
                    )}

                    {!intelligence.macroAnalysis && (
                      <p className="sp-notice">
                        Macro context is
                        unavailable.
                      </p>
                    )}
                  </Evidence>

                  <Evidence
                    title="05 · Mentor perspective"
                    description="Confirmation, invalidation and the discipline behind the setup"
                  >
                    <AIInstitutionalMentorCard
                      setup={setup}
                    />
                  </Evidence>

                  <Evidence
                    title="06 · Other opportunities"
                    description="Compare this market with the rest of the active universe"
                  >
                    {intelligence.marketSelection ? (
                      <OpportunityRankingBoard
                        marketSelection={
                          intelligence
                            .marketSelection
                        }
                        selected={
                          symbol
                        }
                      />
                    ) : (
                      <p className="text-sm text-slate-400">
                        Rankings are
                        currently
                        unavailable.
                      </p>
                    )}
                  </Evidence>
                </section>
              </>
            ) : (
              <section className="sp-panel">
                <h2 className="text-xl font-semibold">
                  Intelligence unavailable
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  There is not enough
                  verified information to
                  analyze this market yet.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
