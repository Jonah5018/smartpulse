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
  MarketSessionService,
} from "@/lib/market-session";

import {
  MarketAvailabilityService,
} from "@/lib/market-session/market-availability-service";

import {
  getActiveMarketSymbols,
} from "@/lib/market/market-universe";

import {
  MarketSelectionService,
} from "@/lib/market-selection";

import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  Opportunity,
} from "@/lib/opportunity";

import type {
  FocusScore,
} from "@/lib/focus-score";

import type {
  OpportunityDecision,
} from "@/lib/decision";

import {
  AIIntelligenceService,
} from "@/lib/ai/intelligence";


interface MarketAnalysis {
  setup: InstitutionalSetup;

  opportunity: Opportunity;

  focus: FocusScore;

  decision: OpportunityDecision;

  insights: string[];

  overallBias: string;

  confidence: number;

  generatedAt: string;
}


export class LoadMarketIntelligence {
  static async execute(
    symbol: string,
    watchlist: string[] = []
  ) {
    /*
     * ------------------------------------------------
     * SESSION CONTEXT
     * ------------------------------------------------
     *
     * This remains useful as general market-session
     * context for the dashboard.
     *
     * It is NOT used as the universal trading
     * availability gate anymore.
     *
     * Individual instruments are evaluated through
     * MarketAvailabilityService below.
     */
    const session =
      MarketSessionService.current();


    /*
     * ------------------------------------------------
     * NORMALIZE REQUESTED SYMBOL
     * ------------------------------------------------
     */

    const normalizedRequestedSymbol =
      symbol
        .trim()
        .toUpperCase();


    /*
     * ------------------------------------------------
     * ACTIVE MARKET UNIVERSE
     * ------------------------------------------------
     *
     * SmartPulse considers the complete enabled
     * market universe.
     */
    const symbols =
      getActiveMarketSymbols();


    /*
     * ------------------------------------------------
     * REQUESTED MARKET AVAILABILITY
     * ------------------------------------------------
     *
     * IMPORTANT:
     *
     * We no longer ask:
     *
     * "Is the Forex session open?"
     *
     * We ask:
     *
     * "Is THIS instrument open?"
     *
     * This allows:
     *
     * Forex → Forex calendar
     * Gold  → Commodity calendar
     * Crypto → 24/7 calendar
     * Index → Index calendar
     */
    const requestedAvailability =
      MarketAvailabilityService.current(
        normalizedRequestedSymbol
      );


    /*
     * ------------------------------------------------
     * MARKET CLOSED
     * ------------------------------------------------
     *
     * If the trader explicitly selected a market
     * that is closed, respect that selection.
     *
     * Do NOT silently replace it with another
     * opportunity from the discovery universe.
     */
    if (
      !requestedAvailability.isOpen
    ) {
      return {
        symbol:
          normalizedRequestedSymbol,

        session,

        setup: null,

        opportunity: null,

        focus: null,

        decision: null,

        marketSelection: null,

        marketClosed: true,

        marketAvailability:
          requestedAvailability,
      };
    }


    /*
     * ------------------------------------------------
     * DETERMINE OPEN MARKETS
     * ------------------------------------------------
     *
     * Every active instrument gets its own
     * availability check.
     *
     * Closed instruments are excluded from live
     * institutional analysis for this cycle.
     */
    const availableSymbols =
      symbols.filter(
        (marketSymbol) =>
          MarketAvailabilityService.current(
            marketSymbol
          ).isOpen
      );


    /*
     * ------------------------------------------------
     * INSTITUTIONAL ANALYSIS
     * ------------------------------------------------
     *
     * Calculate each setup exactly once.
     *
     * The same setup is then reused by:
     *
     * Setup
     *   ↓
     * Opportunity
     *   ↓
     * Focus Score
     *   ↓
     * Decision
     */
    const analysisEntries =
      await Promise.all(
        availableSymbols.map(
          async (marketSymbol) => {
            const setup =
              await InstitutionalSetupService.current(
                marketSymbol,
                "15min",
                200
              );


            const opportunity =
              OpportunityService.fromInstitutionalSetup(
                setup
              );


            const focus =
              await FocusScoreService.fromOpportunity(
                opportunity
              );


            const decision =
              DecisionService.evaluate(
                setup
              );


            return [
              marketSymbol,

              {
                setup,

                opportunity,

                focus,

                decision,
              },

            ] as const;
          }
        )
      );


    const analyses =
      Object.fromEntries(
        analysisEntries
      ) as Record<
        string,
        MarketAnalysis
      >;


    /*
     * ------------------------------------------------
     * OPPORTUNITY DISCOVERY
     * ------------------------------------------------
     *
     * Only currently available markets participate
     * in live opportunity discovery.
     *
     * Watchlist remains a preference, not a
     * restriction.
     */
    const opportunities =
      Object.fromEntries(
        Object.entries(
          analyses
        ).map(
          ([
            marketSymbol,
            analysis,
          ]) => [
            marketSymbol,
            analysis.opportunity,
          ]
        )
      );


    const marketSelection =
      MarketSelectionService.select(
        watchlist,
        opportunities
      );


    /*
     * ------------------------------------------------
     * DETERMINE REQUESTED MARKET ANALYSIS
     * ------------------------------------------------
     *
     * The explicitly requested market remains
     * authoritative.
     */
    const requestedAnalysis =
      analyses[
        normalizedRequestedSymbol
      ];


    /*
     * ------------------------------------------------
     * DISCOVERY FALLBACK
     * ------------------------------------------------
     *
     * If the requested symbol is valid and has
     * already been analysed, use it.
     *
     * Otherwise SmartPulse can fall back to the
     * strongest currently available opportunity.
     */
    const selectedCandidate =
      marketSelection.bestOpportunity;


    const selectedAnalysis =
      selectedCandidate
        ? analyses[
            selectedCandidate
              .opportunity
              .symbol
          ]
        : null;


    const finalAnalysis =
      requestedAnalysis ??
      selectedAnalysis;
    
    const aiBrief =
      finalAnalysis
        ? await AIIntelligenceService.generateBrief(
            finalAnalysis.setup,
            finalAnalysis as unknown as Parameters<
              typeof AIIntelligenceService.generateBrief
            >[1]
          )
        : null;

    /*
     * ------------------------------------------------
     * NO AVAILABLE ANALYSIS
     * ------------------------------------------------
     *
     * This is different from the requested market
     * being closed.
     *
     * The market may technically be open, but the
     * current analysis cycle may not have produced
     * usable institutional data.
     */
    
    if (!finalAnalysis) {
      return {
        symbol: normalizedRequestedSymbol,

        session,

        setup: null,

        opportunity: null,

        focus: null,

        decision: null,

        marketSelection,

        aiBrief: null,

        marketClosed: false,

        marketAvailability:
          requestedAvailability,
      };
    }


    /*
     * ------------------------------------------------
     * SUCCESS
     * ------------------------------------------------
     */

    return {
      symbol:
        finalAnalysis.setup.symbol,

      session,

      setup:
        finalAnalysis.setup,

      opportunity:
        finalAnalysis.opportunity,

      focus:
        finalAnalysis.focus,

      decision:
        finalAnalysis.decision,

      marketSelection,

      aiBrief,

      marketClosed: false,

      marketAvailability:
        requestedAvailability,
    };
  }
}