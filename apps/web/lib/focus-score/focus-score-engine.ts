import type {
  EconomicCalendarRisk,
} from "@/lib/economic-calendar";

import type {
  SessionStatus,
} from "@/lib/market-session";

import type {
  Opportunity,
} from "@/lib/opportunity";

import type {
  FocusAction,
  FocusPriority,
  FocusScore,
  FocusScoreFactors,
} from "./focus-score-types";

export class FocusScoreEngine {
  static calculate(
    opportunity: Opportunity,
    session: SessionStatus,
    calendarRisk: EconomicCalendarRisk
  ): FocusScore {
    const factors =
      this.calculateFactors(
        opportunity,
        session,
        calendarRisk
      );

    const score =
      this.calculateScore(
        factors
      );

    const priority =
      this.getPriority(
        score,
        opportunity
      );

    const action =
      this.getAction(
        score,
        opportunity,
        calendarRisk
      );

    const warnings =
      this.buildWarnings(
        opportunity,
        calendarRisk
      );

    const reason =
      this.buildReason(
        opportunity,
        score,
        action,
        calendarRisk
      );

    return {
      symbol:
        opportunity.symbol,

      score,

      priority,

      action,

      opportunity,

      factors,

      reason,

      warnings,
    };
  }

  private static calculateFactors(
    opportunity: Opportunity,
    session: SessionStatus,
    calendarRisk: EconomicCalendarRisk
  ): FocusScoreFactors {
    return {
      opportunity:
        this.clamp(
          opportunity.confidence,
          0,
          100
        ),

      setupReadiness:
        this.setupReadiness(
          opportunity
        ),

      multiTimeframeAlignment:
        this.biasAlignment(
          opportunity
        ),

      liquidity:
        this.liquidityScore(
          opportunity
        ),

      displacement:
        this.structureScore(
          opportunity
        ),

      entryQuality:
        this.entryQualityScore(
          opportunity
        ),

      riskReward:
        this.riskRewardScore(),

      sessionQuality:
        this.sessionQuality(
          session
        ),

      calendarRisk:
        this.calendarRiskScore(
          calendarRisk
        ),
    };
  }

  private static calculateScore(
    factors: FocusScoreFactors
  ): number {
    /*
     * Opportunity confidence is currently
     * the strongest available signal.
     *
     * The other factors provide context.
     *
     * We deliberately avoid pretending that
     * FVG, displacement, R:R or entry zones
     * exist in the current Opportunity contract.
     */
    const weighted =
      factors.opportunity * 0.35 +
      factors.setupReadiness * 0.15 +
      factors.multiTimeframeAlignment * 0.12 +
      factors.liquidity * 0.10 +
      factors.displacement * 0.08 +
      factors.entryQuality * 0.05 +
      factors.riskReward * 0.05 +
      factors.sessionQuality * 0.07 +
      factors.calendarRisk * 0.03;

    return Math.round(
      this.clamp(
        weighted,
        0,
        100
      )
    );
  }

  private static setupReadiness(
    opportunity: Opportunity
  ): number {
    switch (
      opportunity.state
    ) {
      case "ready":
        return 100;

      case "forming":
        return 65;

      case "executed":
        return 30;

      case "expired":
        return 0;

      default:
        return 0;
    }
  }

  private static biasAlignment(
    opportunity: Opportunity
  ): number {
    /*
     * Directional opportunity and higher
     * timeframe bias agree.
     */
    if (
      opportunity.direction ===
        "buy" &&
      opportunity.higherTimeframeBias ===
        "bullish"
    ) {
      return 100;
    }

    if (
      opportunity.direction ===
        "sell" &&
      opportunity.higherTimeframeBias ===
        "bearish"
    ) {
      return 100;
    }

    /*
     * Neutral higher-timeframe context does
     * NOT automatically invalidate a lower
     * timeframe opportunity.
     */
    if (
      opportunity.higherTimeframeBias ===
      "neutral"
    ) {
      return 65;
    }

    /*
     * Direction exists but does not agree with
     * the available higher-timeframe context.
     */
    return 35;
  }

  private static liquidityScore(
    opportunity: Opportunity
  ): number {
    if (
      opportunity.liquiditySweep
    ) {
      return 100;
    }

    if (
      opportunity.nearestBuySideLiquidity !==
        null ||
      opportunity.nearestSellSideLiquidity !==
        null
    ) {
      return 70;
    }

    return 35;
  }

  private static structureScore(
    opportunity: Opportunity
  ): number {
    /*
     * At the current architecture stage,
     * the Opportunity already contains the
     * structure produced by Market Structure.
     *
     * We therefore use the existence of a
     * meaningful structure description as
     * supporting evidence rather than inventing
     * a displacement field.
     */
    if (
      opportunity.structure &&
      opportunity.structure !==
        "unknown"
    ) {
      return 80;
    }

    return 35;
  }

  private static entryQualityScore(
    opportunity: Opportunity
  ): number {
    /*
     * Entry-zone analysis has not yet been
     * exposed through Opportunity.
     *
     * Keep this neutral rather than pretending
     * an entry area has been confirmed.
     */
    if (
      opportunity.state ===
      "ready"
    ) {
      return 70;
    }

    if (
      opportunity.state ===
      "forming"
    ) {
      return 45;
    }

    return 25;
  }

  private static riskRewardScore(): number {
    /*
     * Risk/reward is not yet exposed by the
     * current Opportunity contract.
     *
     * Neutral score until Institutional Setup
     * provides a validated R:R calculation.
     */
    return 50;
  }

  private static sessionQuality(
    session: SessionStatus
  ): number {
    if (
      !session.isOpen
    ) {
      return 25;
    }

    if (
      session.overlap ===
      "london_new_york"
    ) {
      return 100;
    }

    if (
      session.overlap ===
      "sydney_tokyo"
    ) {
      return 70;
    }

    if (
      session.overlap ===
      "tokyo_london"
    ) {
      return 70;
    }

    switch (
      session.current
    ) {
      case "london":
        return 90;

      case "new_york":
        return 90;

      case "tokyo":
        return 60;

      case "sydney":
        return 45;

      case "closed":
        return 20;

      default:
        return 20;
    }
  }

  private static calendarRiskScore(
    risk: EconomicCalendarRisk
  ): number {
    if (
      !risk.hasRisk
    ) {
      return 100;
    }

    switch (
      risk.impact
    ) {
      case "high":
        return 35;

      case "medium":
        return 65;

      case "low":
        return 85;

      default:
        return 80;
    }
  }

  private static getPriority(
    score: number,
    opportunity: Opportunity
  ): FocusPriority {
    if (
      opportunity.state ===
      "expired"
    ) {
      return "ignore";
    }

    if (score >= 90) {
      return "critical";
    }

    if (score >= 80) {
      return "high";
    }

    if (score >= 65) {
      return "watch";
    }

    if (score >= 45) {
      return "low";
    }

    return "ignore";
  }

  private static getAction(
    score: number,
    opportunity: Opportunity,
    calendarRisk: EconomicCalendarRisk
  ): FocusAction {
    if (
      opportunity.state ===
      "expired"
    ) {
      return "ignore";
    }

    if (
      calendarRisk.hasRisk &&
      calendarRisk.impact ===
        "high"
    ) {
      return "wait";
    }

    if (
      opportunity.state ===
      "forming"
    ) {
      return "monitor";
    }

    if (
      opportunity.state ===
        "ready" &&
      score >= 85
    ) {
      return "prepare";
    }

    if (
      score >= 65
    ) {
      return "watch";
    }

    return "monitor";
  }

  private static buildWarnings(
    opportunity: Opportunity,
    calendarRisk: EconomicCalendarRisk
  ): string[] {
    const warnings: string[] =
      [];

    if (
      opportunity.state ===
      "forming"
    ) {
      warnings.push(
        "The setup is still forming. Do not treat it as an entry signal."
      );
    }

    if (
      opportunity.higherTimeframeBias ===
      "neutral"
    ) {
      warnings.push(
        "Higher-timeframe context is neutral. This does not automatically invalidate the lower-timeframe opportunity."
      );
    }

    if (
      opportunity.direction ===
        "buy" &&
      opportunity.higherTimeframeBias ===
        "bearish"
    ) {
      warnings.push(
        "The current buy opportunity is developing against the available higher-timeframe bearish bias."
      );
    }

    if (
      opportunity.direction ===
        "sell" &&
      opportunity.higherTimeframeBias ===
        "bullish"
    ) {
      warnings.push(
        "The current sell opportunity is developing against the available higher-timeframe bullish bias."
      );
    }

    if (
      opportunity.nearestBuySideLiquidity ===
        null &&
      opportunity.nearestSellSideLiquidity ===
        null
    ) {
      warnings.push(
        "No nearby liquidity pool has been identified."
      );
    }

    if (
      calendarRisk.hasRisk &&
      calendarRisk.impact ===
        "high"
    ) {
      warnings.push(
        "High calendar risk is present. Avoid rushing into execution around the event."
      );
    }

    return warnings;
  }

  private static buildReason(
    opportunity: Opportunity,
    score: number,
    action: FocusAction,
    calendarRisk: EconomicCalendarRisk
  ): string {
    const direction =
      opportunity.direction ===
      "buy"
        ? "bullish"
        : opportunity.direction ===
            "sell"
          ? "bearish"
          : "neutral";

    const parts: string[] =
      [];

    parts.push(
      `${opportunity.symbol} currently has a ${score}/100 focus score with a ${direction} opportunity.`
    );

    parts.push(
      `The setup is ${opportunity.state}.`
    );

    if (
      opportunity.structure
    ) {
      parts.push(
        `Current structure: ${opportunity.structure}.`
      );
    }

    if (
      opportunity.liquiditySweep
    ) {
      parts.push(
        `${this.liquiditySweepLabel(
          opportunity.liquiditySweep
        )} liquidity has been swept.`
      );
    } else if (
      opportunity.nearestBuySideLiquidity !==
        null ||
      opportunity.nearestSellSideLiquidity !==
        null
    ) {
      parts.push(
        "Relevant liquidity has been identified."
      );
    }

    if (
      opportunity.higherTimeframeBias ===
      "neutral"
    ) {
      parts.push(
        "The higher-timeframe context is neutral, so the lower-timeframe opportunity is evaluated independently rather than automatically rejected."
      );
    }

    if (
      calendarRisk.hasRisk
    ) {
      parts.push(
        `Calendar risk is currently ${calendarRisk.impact}.`
      );
    }

    parts.push(
      `SmartPulse action: ${this.actionLabel(
        action
      )}.`
    );

    return parts.join(
      " "
    );
  }

  private static liquiditySweepLabel(
    sweep:
      | "buy_side"
      | "sell_side"
  ): string {
    return sweep ===
      "buy_side"
      ? "Buy-side"
      : "Sell-side";
  }

  private static actionLabel(
    action: FocusAction
  ): string {
    switch (action) {
      case "review_now":
        return "review now";

      case "prepare":
        return "prepare for the setup";

      case "wait":
        return "wait for safer confirmation";

      case "watch":
        return "keep this market on watch";

      case "monitor":
        return "monitor for confirmation";

      case "ignore":
        return "ignore for now";

      default:
        return "monitor";
    }
  }

  private static clamp(
    value: number,
    minimum: number,
    maximum: number
  ): number {
    return Math.max(
      minimum,
      Math.min(
        maximum,
        value
      )
    );
  }
}