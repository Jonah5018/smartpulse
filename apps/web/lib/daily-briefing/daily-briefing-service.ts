import {
  DailyBriefingEngine,
} from "./daily-briefing-engine";

import {
  macroService,
} from "@/lib/macro";

import type {
  SessionStatus,
} from "@/lib/market-session";

import type {
  Opportunity,
} from "@/lib/opportunity";

import type {
  FocusScore,
} from "@/lib/focus-score";

import type {
  MarketSelection,
} from "@/lib/market-selection";

interface DailyBriefingMarketContext {
  session: SessionStatus;

  topFocus: FocusScore | null;

  opportunities: Record<string, Opportunity>;

  marketSelection: MarketSelection;
}

export class DailyBriefingService {
  static async create(
    fullName: string,
    market: DailyBriefingMarketContext
  ) {
    const macro =
      await macroService.getTodayAnalysis();

    return DailyBriefingEngine.generate(
      fullName,
      market,
      macro
    );
  }
}