import {
  DailyBriefingBuilder,
} from "@/lib/daily-briefing";

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

import type {
  MacroAnalysisResult,
} from "@/lib/macro";

interface DailyBriefingMarketContext {
  session: SessionStatus;

  topFocus:
    | FocusScore
    | null;

  opportunities:
    Record<
      string,
      Opportunity
    >;

  marketSelection: MarketSelection;
}

export class LoadDailyBriefing {
  static async execute(
    fullName: string,
    market: DailyBriefingMarketContext,
    macro: MacroAnalysisResult
  ) {
    return DailyBriefingBuilder.build(
      fullName,
      market,
      macro
    );
  }
}