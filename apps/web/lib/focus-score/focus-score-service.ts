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

export class FocusScoreService {
  static async current(
    symbol: string
  ): Promise<FocusScore> {
    const [
      opportunity,
      session,
      calendarRisk,
    ] = await Promise.all([
      OpportunityService.current(
        symbol
      ),

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
}