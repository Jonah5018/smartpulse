import type {
  Opportunity,
} from "./opportunity-types";

export class OpportunityScore {
  static calculate(
    opportunity: Opportunity
  ): number {
    let score =
      opportunity.confidence;

    /*
     * READY setups deserve significantly more
     * attention than setups that are merely
     * forming.
     */
    if (
      opportunity.state ===
      "ready"
    ) {
      score += 15;
    }

    if (
      opportunity.state ===
      "forming"
    ) {
      score += 3;
    }

    if (
      opportunity.state ===
      "no_setup"
    ) {
      score -= 25;
    }

    /*
     * Multi-timeframe alignment.
     */
    if (
      opportunity.multiTimeframeAlignment ===
      "aligned"
    ) {
      score += 10;
    }

    if (
      opportunity.multiTimeframeAlignment ===
      "partially_aligned"
    ) {
      score += 4;
    }

    if (
      opportunity.multiTimeframeAlignment ===
      "countertrend"
    ) {
      score -= 15;
    }

    /*
     * A range context is not automatically bad.
     *
     * SmartPulse should be able to identify
     * lower-timeframe opportunities developing
     * inside a broader range.
     */
    if (
      opportunity.multiTimeframeAlignment ===
      "range_context"
    ) {
      score += 2;
    }

    /*
     * Liquidity interaction.
     */
    if (
      opportunity.liquiditySweep
    ) {
      score += 7;
    }

    /*
     * Displacement provides stronger evidence
     * than structure alone.
     */
    if (
      opportunity.displacement
    ) {
      score += 8;
    }

    /*
     * A defined entry area is important.
     */
    if (
      opportunity.entryZone
    ) {
      score += 6;
    }

    /*
     * A defined invalidation means SmartPulse
     * can actually reason about risk.
     */
    if (
      opportunity.invalidation !==
      null
    ) {
      score += 4;
    }

    /*
     * R:R is one of the most important filters.
     *
     * We reward attractive asymmetric setups,
     * but we do not allow R:R alone to create
     * a good opportunity.
     */
    const ratio =
      opportunity.riskReward
        ?.ratio ?? 0;

    if (ratio >= 3) {
      score += 15;
    } else if (ratio >= 2.5) {
      score += 10;
    } else if (ratio >= 2) {
      score += 6;
    } else if (
      ratio > 0 &&
      ratio < 1.5
    ) {
      score -= 12;
    }

    /*
     * Quality classification.
     */
    if (
      opportunity.quality ===
      "exceptional"
    ) {
      score += 8;
    }

    if (
      opportunity.quality ===
      "high"
    ) {
      score += 5;
    }

    if (
      opportunity.quality ===
      "low"
    ) {
      score -= 5;
    }

    return Math.round(
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      )
    );
  }
}