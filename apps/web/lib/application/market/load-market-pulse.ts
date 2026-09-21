import {
  MarketService,
  MockMarketProvider,
} from "@/lib/market";

import type {
  MarketType,
} from "@/lib/market";

import type {
  MarketQuote,
} from "@/lib/market/market-types";

import {
  MarketRepository,
} from "@/lib/repositories/market";

import {
  InstitutionalSetupService,
} from "@/lib/institutional-setup";

import {
  OpportunityService,
} from "@/lib/opportunity";

import {
  FocusScoreService,
} from "@/lib/focus-score";

import {
  DecisionService,
} from "@/lib/decision";

import {
  MarketDataError,
  type LiveMarketQuote,
} from "@/lib/providers/market-data";

import {
  MarketScannerService,
} from "@/lib/market-scanner";

import {
  getActiveMarketSymbols,
} from "@/lib/market/market-universe";

import {
  MarketSelectionService,
} from "@/lib/market-selection";


export class LoadMarketPulse {
  static async execute(
    watchlist: string[] = []
  ) {
    const provider =
      new MockMarketProvider();

    const symbols =
      getActiveMarketSymbols();


    /*
     * ------------------------------------------------
     * MARKET SESSION
     * ------------------------------------------------
     */

    const session =
      await provider.getSessionStatus();


    /*
     * ------------------------------------------------
     * MARKET SCANNER
     * ------------------------------------------------
     *
     * The scanner uses the same MarketRepository
     * quote cache used by the rest of SmartPulse.
     *
     * It does NOT create an independent provider
     * request pipeline.
     */

    if (!session.isOpen) {
      return {
        quotes: [], pulse: MarketService.buildPulse([], session), session,
        marketScan: [], opportunities: {}, focusScores: [], topFocus: null,
        decisions: {}, marketSelection: MarketSelectionService.select(watchlist, {}),
        dataStatus: {
          available: false, provider: "twelve-data", status: null, retryable: false,
          message: "Markets are closed. Live analysis resumes with the next trading session.",
        },
      };
    }

    let marketScan = [];

    try {
      marketScan =
        await MarketScannerService.current();

    } catch (error) {
      if (
        error instanceof
        MarketDataError
      ) {
        return {
          quotes: [],

          pulse:
            MarketService.buildPulse(
              [],
              session
            ),

          session,

          marketScan: [],

          opportunities: {},

          focusScores: [],

          topFocus: null,

          decisions: {},

          marketSelection:
            MarketSelectionService.select(
              watchlist,
              {}
            ),

          dataStatus: {
            available: false,

            provider:
              error.provider,

            status:
              error.status,

            retryable:
              error.retryable,

            message:
              error.status === 429
                ? "Live market data is temporarily rate-limited. Please try again shortly."
                : "Live market data is temporarily unavailable.",
          },
        };
      }

      throw error;
    }


    /*
     * ------------------------------------------------
     * MARKET QUOTES
     * ------------------------------------------------
     *
     * MarketScannerService has already populated
     * the quote cache, so this normally returns
     * cached data instead of creating another
     * Twelve Data request.
     *
     * IMPORTANT:
     *
     * Bid and ask are allowed to be null at the
     * provider layer.
     *
     * SmartPulse must NEVER manufacture a spread
     * from incomplete quote data.
     *
     * A quote only becomes a MarketQuote when both
     * bid and ask are actually available.
     */

    let quotes: MarketQuote[] = [];
    let priceQuotes: LiveMarketQuote[] = [];

    try {
      const liveQuotes =
        await MarketRepository.getQuotes(
          symbols
        );


      priceQuotes = liveQuotes.filter((quote) => Number.isFinite(quote.price) && Number.isFinite(quote.changePercent));

      const normalizedQuotes =
        liveQuotes
          .map(
            (quote) => {
              /*
               * A quote without either bid or ask
               * cannot produce a trustworthy spread.
               *
               * Do not convert missing values to zero.
               */
              if (
                quote.bid === null ||
                quote.ask === null
              ) {
                return null;
              }


              const marketType =
                (
                  quote.symbol ===
                  "XAU/USD"
                    ? "commodity"
                    : "forex"
                ) as MarketType;


              return {
                symbol:
                  quote.symbol.replace(
                    "/",
                    ""
                  ),

                name:
                  quote.name,

                type:
                  marketType,

                bid:
                  quote.bid,

                ask:
                  quote.ask,

                spread:
                  Number(
                    (
                      quote.ask -
                      quote.bid
                    ).toFixed(5)
                  ),

                changePercent:
                  quote.changePercent,

                timestamp:
                  quote.timestamp,
              } satisfies MarketQuote;
            }
          )
          .filter(
            (
              quote
            ): quote is MarketQuote =>
              quote !== null
          );


      quotes =
        normalizedQuotes;

    } catch (error) {
      if (
        error instanceof
        MarketDataError
      ) {
        return {
          quotes: [],

          pulse:
            MarketService.buildPulse(
              [],
              session
            ),

          session,

          marketScan: [],

          opportunities: {},

          focusScores: [],

          topFocus: null,

          decisions: {},

          marketSelection:
            MarketSelectionService.select(
              watchlist,
              {}
            ),

          dataStatus: {
            available: false,

            provider:
              error.provider,

            status:
              error.status,

            retryable:
              error.retryable,

            message:
              error.status === 429
                ? "Live market data is temporarily rate-limited. Please try again shortly."
                : "Live market data is temporarily unavailable.",
          },
        };
      }

      throw error;
    }


    /*
     * ------------------------------------------------
     * MARKET PULSE
     * ------------------------------------------------
     *
     * Price movement drives the pulse independently of executable spreads.
     */

    const pulse =
      MarketService.buildPulse(
        priceQuotes,
        session
      );


    /*
     * ------------------------------------------------
     * INSTITUTIONAL ANALYSIS
     * ------------------------------------------------
     *
     * One institutional setup is calculated
     * per symbol.
     *
     * Opportunity, Focus Score and Decision
     * all reuse that same setup.
     */

    try {
      const analysisEntries =
        await Promise.all(
          symbols.map(
            async (symbol) => {
              const setup =
                await InstitutionalSetupService.current(
                  symbol,
                  "15min",
                  200
                );


              const opportunity =
                OpportunityService.fromInstitutionalSetup(
                  setup
                );


              const focusScore =
                await FocusScoreService.fromOpportunity(
                  opportunity
                );


              const decision =
                DecisionService.evaluate(
                  setup
                );


              return [
                symbol,

                {
                  setup,

                  opportunity,

                  focusScore,

                  decision,
                },

              ] as const;
            }
          )
        );


      const analyses =
        Object.fromEntries(
          analysisEntries
        );


      /*
       * ------------------------------------------------
       * FOCUS SCORES
       * ------------------------------------------------
       */

      const focusScores =
        Object.values(
          analyses
        )
          .map(
            (analysis) =>
              analysis.focusScore
          )
          .sort(
            (a, b) =>
              b.score -
              a.score
          );


      /*
       * ------------------------------------------------
       * OPPORTUNITIES
       * ------------------------------------------------
       */

      const opportunities =
        Object.fromEntries(
          Object.entries(
            analyses
          ).map(
            ([
              symbol,
              analysis,
            ]) => [
              symbol,
              analysis.opportunity,
            ]
          )
        );


      /*
       * ------------------------------------------------
       * MARKET SELECTION
       * ------------------------------------------------
       *
       * IMPORTANT:
       *
       * We are NOT running institutional analysis
       * again here.
       *
       * MarketSelectionService simply evaluates
       * the opportunities that were already
       * calculated above.
       *
       * This allows SmartPulse to discover a
       * stronger opportunity outside the trader's
       * watchlist without creating duplicate
       * provider requests.
       */

      const marketSelection =
        MarketSelectionService.select(
          watchlist,
          opportunities
        );


      /*
       * ------------------------------------------------
       * DECISIONS
       * ------------------------------------------------
       */

      const decisions =
        Object.fromEntries(
          Object.entries(
            analyses
          ).map(
            ([
              symbol,
              analysis,
            ]) => [
              symbol,
              analysis.decision,
            ]
          )
        );


      /*
       * ------------------------------------------------
       * FINAL SUCCESSFUL RESULT
       * ------------------------------------------------
       */

      return {
        quotes,

        pulse,

        session,

        marketScan,

        opportunities,

        focusScores,

        topFocus:
          focusScores[0] ??
          null,

        decisions,

        marketSelection,

        dataStatus: {
          available:
            priceQuotes.length > 0,

          provider:
            "twelve-data",

          status: 200,

          retryable: false,

          message:
            priceQuotes.length > 0
              ? "Live market prices and analysis are available. Bid/ask spreads may be unavailable."
              : "Live market prices are temporarily unavailable.",
        },
      };

    } catch (error) {
      /*
       * Market quotes and scanner data may have
       * succeeded while deeper institutional
       * analysis failed.
       *
       * Do not crash the entire dashboard.
       */

      if (
        error instanceof
        MarketDataError
      ) {
        return {
          quotes,

          pulse,

          session,

          marketScan,

          opportunities: {},

          focusScores: [],

          topFocus: null,

          decisions: {},

          marketSelection:
            MarketSelectionService.select(
              watchlist,
              {}
            ),

          dataStatus: {
            available: false,

            provider:
              error.provider,

            status:
              error.status,

            retryable:
              error.retryable,

            message:
              error.status === 429
                ? "Live market data is temporarily rate-limited. Please try again shortly."
                : "Live institutional market analysis is temporarily unavailable.",
          },
        };
      }

      throw error;
    }
  }
}