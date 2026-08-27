import {
  OpportunityService,
} from "@/lib/opportunity";

import {
  MarketSessionService,
} from "@/lib/market-session";

import {
  EconomicCalendarAnalysisService,
} from "@/lib/economic-calendar";

import {
  FocusScoreEngine,
} from "./focus-score-engine";

import type {
  FocusScore,
} from "./focus-score-types";

import type {
  Opportunity,
} from "@/lib/opportunity";

import type {
  TraderAnalysisProfile,
} from "@/lib/multi-timeframe";

export class FocusScoreService {
  /**
   * Calculate Focus Score from an existing
   * Opportunity.
   *
   * This is the preferred path when the
   * caller already has an Opportunity.
   */
  static async fromOpportunity(
    opportunity: Opportunity
  ): Promise<FocusScore> {
    const [
      session,
      calendarRisk,
    ] = await Promise.all([
      Promise.resolve(
        MarketSessionService.current()
      ),

      EconomicCalendarAnalysisService.risk(
        30
      ),
    ]);

    return FocusScoreEngine.calculate(
      opportunity,
      session,
      calendarRisk
    );
  }

  /**
   * Convenience method for callers that do
   * not already have an Opportunity.
   *
   * This preserves the existing API while
   * delegating the actual scoring to the
   * Opportunity-based path.
   */
  static async current(
    symbol: string,
    profile?: TraderAnalysisProfile
  ): Promise<FocusScore> {
    const opportunity =
      await OpportunityService.current(
        symbol,
        profile
      );

    return this.fromOpportunity(
      opportunity
    );
  }
}