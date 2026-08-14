import type {
  ExperienceLevel,
  TradingStyle,
  Timeframe,
} from "./types";

import type { AssetClass } from "@/lib/markets";

import type { TraderProfileDraft } from "@/lib/profiles";

export class TraderProfileDraftBuilder {
  static create(): TraderProfileDraft {
    return {
      experience_level: undefined,

      trading_styles: [],

      preferred_timeframes: [],

      market_categories: [],

      favorite_markets: [],

      goals: [],

      challenges: [],

      learning_mode: "learning",
    };
  }

  static setExperienceLevel(
    draft: TraderProfileDraft,
    level: ExperienceLevel
  ): TraderProfileDraft {
    return {
      ...draft,
      experience_level: level,
    };
  }

  static setTradingStyles(
    draft: TraderProfileDraft,
    styles: TradingStyle[]
  ): TraderProfileDraft {
    return {
      ...draft,
      trading_styles: styles,
    };
  }

  static setPreferredTimeframes(
    draft: TraderProfileDraft,
    timeframes: Timeframe[]
  ): TraderProfileDraft {
    return {
      ...draft,
      preferred_timeframes: timeframes,
    };
  }

  static setMarketCategories(
    draft: TraderProfileDraft,
    categories: AssetClass[]
  ): TraderProfileDraft {
    return {
      ...draft,
      market_categories: categories,
    };
  }

  static setFavoriteMarkets(
    draft: TraderProfileDraft,
    markets: string[]
  ): TraderProfileDraft {
    return {
      ...draft,
      favorite_markets: markets,
    };
  }

  static setGoals(
    draft: TraderProfileDraft,
    goals: string[]
  ): TraderProfileDraft {
    return {
      ...draft,
      goals,
    };
  }

  static setChallenges(
    draft: TraderProfileDraft,
    challenges: string[]
  ): TraderProfileDraft {
    return {
      ...draft,
      challenges,
    };
  }
}