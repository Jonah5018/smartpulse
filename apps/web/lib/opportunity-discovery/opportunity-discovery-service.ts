import type {
  Opportunity,
} from "@/lib/opportunity";

import type {
  OpportunityCandidate,
  OpportunityDiscoveryResult,
  OpportunitySource,
} from "./opportunity-discovery-types";


/**
 * Minimum score required before an opportunity
 * outside the trader's watchlist can be surfaced
 * as a SmartPulse Discovery.
 *
 * Discovery is intentionally selective.
 */
export const SMARTPULSE_DISCOVERY_THRESHOLD = 80;


const STATE_SCORE: Record<
  Opportunity["state"],
  number
> = {
  ready: 40,

  forming: 20,

  no_setup: 0,

  executed: 0,

  expired: 0,
};


const QUALITY_SCORE: Record<
  Opportunity["quality"],
  number
> = {
  exceptional: 30,

  high: 22,

  moderate: 12,

  low: 4,
};


const ALIGNMENT_SCORE: Record<
  Opportunity["multiTimeframeAlignment"],
  number
> = {
  aligned: 15,

  partially_aligned: 8,

  countertrend: 0,

  range_context: 3,
};


export class OpportunityDiscoveryService {
  /**
   * Rank already-calculated opportunities.
   *
   * No market-data request is performed here.
   *
   * SmartPulse deliberately separates:
   *
   * 1. Watchlist opportunities.
   * 2. Discovery opportunities.
   *
   * A market outside the watchlist is NOT
   * automatically considered a discovery.
   *
   * It must first meet the discovery threshold.
   */
  static rank(
    opportunities: Record<
      string,
      Opportunity
    >,

    watchedSymbols: string[],

    discoverySymbols: string[]
  ): OpportunityDiscoveryResult {
    const watchedSet =
      new Set(
        watchedSymbols.map(
          (symbol) =>
            symbol
              .trim()
              .toUpperCase()
        )
      );


    const discoverySet =
      new Set(
        discoverySymbols.map(
          (symbol) =>
            symbol
              .trim()
              .toUpperCase()
        )
      );


    /*
     * ------------------------------------------------
     * BUILD CANDIDATES
     * ------------------------------------------------
     */

    const candidates =
      Object.entries(
        opportunities
      )
        .map(
          ([
            symbol,
            opportunity,
          ]) => {
            const normalizedSymbol =
              symbol
                .trim()
                .toUpperCase();


            let source:
              | OpportunitySource
              | null =
              null;


            /*
             * Watchlist always takes precedence.
             *
             * A market cannot simultaneously
             * belong to both groups.
             */
            if (
              watchedSet.has(
                normalizedSymbol
              )
            ) {
              source =
                "watchlist";

            } else if (
              discoverySet.has(
                normalizedSymbol
              )
            ) {
              source =
                "discovery";
            }


            if (!source) {
              return null;
            }


            return this.buildCandidate(
              opportunity,
              source
            );
          }
        )
        .filter(
          (
            candidate
          ): candidate is OpportunityCandidate =>
            candidate !== null
        );


    /*
     * ------------------------------------------------
     * RANK ALL CANDIDATES
     * ------------------------------------------------
     *
     * The ranking itself is source-neutral.
     *
     * Source-specific rules are applied after
     * ranking so that discovery remains selective.
     */

    candidates.sort(
      (a, b) =>
        b.score -
        a.score
    );


    /*
     * ------------------------------------------------
     * BEST WATCHLIST OPPORTUNITY
     * ------------------------------------------------
     */

    const bestWatched =
      candidates.find(
        (candidate) =>
          candidate.source ===
          "watchlist"
      ) ??
      null;


    /*
     * ------------------------------------------------
     * BEST DISCOVERY OPPORTUNITY
     * ------------------------------------------------
     *
     * Only an outside-watchlist opportunity
     * meeting the discovery threshold qualifies.
     */

    const bestDiscovery =
      candidates.find(
        (candidate) =>
          candidate.source ===
            "discovery" &&
          candidate.score >=
            SMARTPULSE_DISCOVERY_THRESHOLD
      ) ??
      null;


    /*
     * ------------------------------------------------
     * BEST ACTIONABLE OPPORTUNITY
     * ------------------------------------------------
     *
     * IMPORTANT:
     *
     * A discovery candidate below the threshold
     * is excluded from this decision.
     *
     * Therefore SmartPulse will not interrupt
     * the trader with a mediocre outside-market
     * opportunity.
     */

    const actionableCandidates =
      [
        bestWatched,
        bestDiscovery,
      ].filter(
        (
          candidate
        ): candidate is OpportunityCandidate =>
          candidate !== null
      );


    actionableCandidates.sort(
      (a, b) =>
        b.score -
        a.score
    );


    const best =
      actionableCandidates[0] ??
      null;


    return {
      best,

      bestWatched,

      bestDiscovery,

      candidates,
    };
  }


  /**
   * Convert an Opportunity into a ranked
   * candidate.
   */
  private static buildCandidate(
    opportunity: Opportunity,

    source: OpportunitySource
  ): OpportunityCandidate {
    return {
      opportunity,

      source,

      score:
        this.calculateScore(
          opportunity
        ),
    };
  }


  /**
   * Calculate SmartPulse opportunity score.
   *
   * The score combines:
   *
   * - setup state
   * - setup quality
   * - confidence
   * - multi-timeframe alignment
   * - risk/reward
   *
   * The final score is capped at 100.
   */
  private static calculateScore(
    opportunity: Opportunity
  ): number {
    const stateScore =
      STATE_SCORE[
        opportunity.state
      ];


    const qualityScore =
      QUALITY_SCORE[
        opportunity.quality
      ];


    const confidenceScore =
      Math.round(
        opportunity.confidence *
          0.15
      );


    const alignmentScore =
      ALIGNMENT_SCORE[
        opportunity
          .multiTimeframeAlignment
      ];


    const riskRewardScore =
      opportunity.riskReward
        ? Math.min(
            15,

            Math.round(
              opportunity.riskReward.ratio *
                3
            )
          )

        : 0;


    return Math.min(
      100,

      stateScore +
        qualityScore +
        confidenceScore +
        alignmentScore +
        riskRewardScore
    );
  }
}