
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

import {
  AnalysisCache,
} from "@/lib/analysis-cache";

interface MarketAnalysis {
  setup: InstitutionalSetup;
  opportunity: Opportunity;
  focus: FocusScore;
  decision: OpportunityDecision;
}

export class LoadMarketIntelligence {
  static async execute(
    symbol: string,
    watchlist: string[] = []
  ): Promise<{
    symbol: string;
    session: ReturnType<typeof MarketSessionService.current>;
    setup: InstitutionalSetup | null;
    opportunity: Opportunity | null;
    focus: FocusScore | null;
    decision: OpportunityDecision | null;
    marketSelection: ReturnType<typeof MarketSelectionService.select> | null;
    aiBrief: Awaited<ReturnType<typeof AIIntelligenceService.generateBrief>> | null;
    marketClosed: boolean;
    marketAvailability: ReturnType<typeof MarketAvailabilityService.current>;
  }> {
    /*
     * ------------------------------------------------
     * SESSION CONTEXT
     * ------------------------------------------------
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
     * ANALYSIS CACHE
     * ------------------------------------------------
     */
    const cacheKey =
      `analysis:${normalizedRequestedSymbol}`;

    const cached =
      AnalysisCache.get<
        Awaited<
          ReturnType<
            typeof LoadMarketIntelligence.execute
          >
        >
      >(cacheKey);

    if (cached) {
      return cached;
    }

    /*
     * ------------------------------------------------
     * ACTIVE MARKET UNIVERSE
     * ------------------------------------------------
     */
    const symbols =
      getActiveMarketSymbols();

    /*
     * ------------------------------------------------
     * REQUESTED MARKET AVAILABILITY
     * ------------------------------------------------
     */
    const requestedAvailability =
      MarketAvailabilityService.current(
        normalizedRequestedSymbol
      );

    /*
     * ------------------------------------------------
     * MARKET CLOSED
     * ------------------------------------------------
     */
    if (
      !requestedAvailability.isOpen
    ) {
      const result = {
        symbol:
          normalizedRequestedSymbol,

        session,

        setup: null,

        opportunity: null,

        focus: null,

        decision: null,

        marketSelection: null,

        aiBrief: null,

        marketClosed: true,

        marketAvailability:
          requestedAvailability,
      };

      AnalysisCache.set(
        cacheKey,
        result,
        60
      );

      return result;
    }

    /*
     * ------------------------------------------------
     * DETERMINE OPEN MARKETS
     * ------------------------------------------------
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
     * REQUESTED MARKET
     * ------------------------------------------------
     */
    const requestedAnalysis =
      analyses[
        normalizedRequestedSymbol
      ];

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
     */
    if (!finalAnalysis) {
      const result = {
        symbol:
          normalizedRequestedSymbol,

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

      AnalysisCache.set(
        cacheKey,
        result,
        60
      );

      return result;
    }

    /*
     * ------------------------------------------------
     * SUCCESS
     * ------------------------------------------------
     */
    const result = {
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

    /*
     * ------------------------------------------------
     * STORE ANALYSIS CACHE
     * ------------------------------------------------
     */
    AnalysisCache.set(
      cacheKey,
      result,
      60
    );

    return result;
  }
}