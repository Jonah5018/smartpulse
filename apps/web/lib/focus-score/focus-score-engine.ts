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
  FocusScoreBreakdown,
  FocusScoreFactors,
} from "./focus-score-types";


/**
 * Focus Score weights.
 *
 * The weights intentionally sum to 1.00.
 *
 * Opportunity confidence is currently the
 * strongest available signal, while the remaining
 * factors provide contextual confirmation.
 */
const FOCUS_SCORE_WEIGHTS = {
  opportunity: 0.35,

  setupReadiness: 0.15,

  multiTimeframeAlignment: 0.12,

  liquidity: 0.10,

  displacement: 0.08,

  entryQuality: 0.05,

  riskReward: 0.05,

  sessionQuality: 0.07,

  calendarRisk: 0.03,
} satisfies Record<
  keyof FocusScoreFactors,
  number
>;


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

    const breakdown =
      this.calculateBreakdown(
        factors
      );

    const score =
      this.calculateScore(
        breakdown
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

      breakdown,

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
        this.displacementScore(
          opportunity
        ),

      entryQuality:
        this.entryQualityScore(
          opportunity
        ),

      riskReward:
        this.riskRewardScore(
          opportunity
        ),

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


  /**
   * Convert normalized factor scores into
   * explainable contributions.
   */
  private static calculateBreakdown(
    factors: FocusScoreFactors
  ): FocusScoreBreakdown {
    return {
      opportunity:
        this.breakdownItem(
          factors.opportunity,
          FOCUS_SCORE_WEIGHTS.opportunity
        ),

      setupReadiness:
        this.breakdownItem(
          factors.setupReadiness,
          FOCUS_SCORE_WEIGHTS.setupReadiness
        ),

      multiTimeframeAlignment:
        this.breakdownItem(
          factors.multiTimeframeAlignment,
          FOCUS_SCORE_WEIGHTS.multiTimeframeAlignment
        ),

      liquidity:
        this.breakdownItem(
          factors.liquidity,
          FOCUS_SCORE_WEIGHTS.liquidity
        ),

      displacement:
        this.breakdownItem(
          factors.displacement,
          FOCUS_SCORE_WEIGHTS.displacement
        ),

      entryQuality:
        this.breakdownItem(
          factors.entryQuality,
          FOCUS_SCORE_WEIGHTS.entryQuality
        ),

      riskReward:
        this.breakdownItem(
          factors.riskReward,
          FOCUS_SCORE_WEIGHTS.riskReward
        ),

      sessionQuality:
        this.breakdownItem(
          factors.sessionQuality,
          FOCUS_SCORE_WEIGHTS.sessionQuality
        ),

      calendarRisk:
        this.breakdownItem(
          factors.calendarRisk,
          FOCUS_SCORE_WEIGHTS.calendarRisk
        ),
    };
  }


  private static breakdownItem(
    rawScore: number,
    weight: number
  ) {
    return {
      rawScore,

      weight,

      contribution:
        Number(
          (
            rawScore *
            weight
          ).toFixed(2)
        ),
    };
  }


  private static calculateScore(
    breakdown: FocusScoreBreakdown
  ): number {
    const total =
      Object.values(
        breakdown
      ).reduce(
        (
          sum,
          factor
        ) =>
          sum +
          factor.contribution,
        0
      );

    return Math.round(
      this.clamp(
        total,
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

    if (
      opportunity.higherTimeframeBias ===
      "neutral"
    ) {
      return 65;
    }

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


  /**
   * Use the actual displacement signal
   * already exposed by Opportunity.
   */
  private static displacementScore(
    opportunity: Opportunity
  ): number {
    if (
      opportunity.displacement
    ) {
      return 100;
    }

    if (
      opportunity.structureEvent ===
        "bos" ||
      opportunity.structureEvent ===
        "mss" ||
      opportunity.structureEvent ===
        "choch"
    ) {
      return 75;
    }

    return 35;
  }


  /**
   * Use the actual entry zone exposed
   * by Opportunity.
   */
  private static entryQualityScore(
    opportunity: Opportunity
  ): number {
    if (
      opportunity.entryZone &&
      opportunity.invalidation !==
        null
    ) {
      return 100;
    }

    if (
      opportunity.entryZone
    ) {
      return 75;
    }

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


  /**
   * Use the validated Risk/Reward data
   * already exposed by Opportunity.
   */
  private static riskRewardScore(
    opportunity: Opportunity
  ): number {
    const ratio =
      opportunity.riskReward
        ?.ratio;

    if (
      ratio === undefined ||
      !Number.isFinite(ratio)
    ) {
      return 50;
    }

    if (
      ratio >= 4
    ) {
      return 100;
    }

    if (
      ratio >= 3
    ) {
      return 90;
    }

    if (
      ratio >= 2
    ) {
      return 80;
    }

    if (
      ratio >= 1.5
    ) {
      return 65;
    }

    if (
      ratio >= 1
    ) {
      return 45;
    }

    return 20;
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

    if (
      score >= 90
    ) {
      return "critical";
    }

    if (
      score >= 80
    ) {
      return "high";
    }

    if (
      score >= 65
    ) {
      return "watch";
    }

    if (
      score >= 45
    ) {
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
      !opportunity.riskReward
    ) {
      warnings.push(
        "Validated risk/reward information is not currently available."
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
      opportunity.displacement
    ) {
      parts.push(
        `Displacement is ${opportunity.displacement}.`
      );
    }

    if (
      opportunity.riskReward
    ) {
      parts.push(
        `Validated risk/reward is ${opportunity.riskReward.ratio.toFixed(2)}R.`
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