import {
  InstitutionalSetupService,
} from "@/lib/institutional-setup";

import type {
  TraderAnalysisProfile,
} from "@/lib/multi-timeframe";

import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  Opportunity,
  OpportunityDirection,
} from "./opportunity-types";

export class OpportunityEngine {
  static async current(
    symbol: string,
    profile?: TraderAnalysisProfile
  ): Promise<Opportunity> {
    const setup =
      await InstitutionalSetupService.current(
        symbol,
        undefined,
        200,
        profile
      );

    return this.fromInstitutionalSetup(
      setup
    );
  }

  /**
   * Build an Opportunity from an already
   * calculated Institutional Setup.
   *
   * This allows higher-level orchestration
   * to calculate the institutional setup once
   * and reuse it across multiple SmartPulse
   * intelligence layers.
   */
  static fromInstitutionalSetup(
    setup: InstitutionalSetup
  ): Opportunity {
    const direction =
      this.toOpportunityDirection(
        setup.direction
      );

    const higherTimeframeBias =
      this.toOpportunityBias(
        setup.direction
      );

    return {
      symbol:
        setup.symbol,

      state:
        setup.state,

      confidence:
        setup.confidence,

      direction,

      quality:
        setup.quality,

      setupContext:
        setup.setupContext,

      structure:
        setup.marketStructure,

      structureEvent:
        setup.structureEvent,

      higherTimeframeBias,

      contextTimeframe:
        setup.contextTimeframe,

      contextTrend:
        setup.contextTrend,

      structureTimeframe:
        setup.structureTimeframe,

      executionTimeframe:
        setup.executionTimeframe,

      multiTimeframeAlignment:
        setup.multiTimeframeAlignment,

      nearestBuySideLiquidity:
        setup.direction === "buy"
          ? setup.targetLiquidity
          : null,

      nearestSellSideLiquidity:
        setup.direction === "sell"
          ? setup.targetLiquidity
          : null,

      liquiditySweep:
        setup.liquiditySweep,

      displacement:
        setup.displacement?.direction === "bullish"
          ? "bullish"
          : setup.displacement?.direction === "bearish"
            ? "bearish"
            : null,

      entryZone:
        setup.entryZone,

      invalidation:
        setup.invalidation,

      targetLiquidity:
        setup.targetLiquidity,

      riskReward:
        setup.riskReward,

      summary:
        setup.summary,

      explanation:
        setup.explanation,
    };
  }

  private static toOpportunityDirection(
    direction:
      | "buy"
      | "sell"
      | "neutral"
  ): OpportunityDirection {
    return direction;
  }

  private static toOpportunityBias(
    direction:
      | "buy"
      | "sell"
      | "neutral"
  ):
    | "bullish"
    | "bearish"
    | "neutral" {
    if (
      direction === "buy"
    ) {
      return "bullish";
    }

    if (
      direction === "sell"
    ) {
      return "bearish";
    }

    return "neutral";
  }
}