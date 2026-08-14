import type {
  DailyBriefing,
} from "./daily-briefing-types";

import {
  MissionService,
} from "@/lib/mission";

import {
  ContextService,
} from "@/lib/context";

import {
  OpportunityService,
} from "@/lib/opportunity";

import {
  MarketStructureService,
} from "@/lib/market-structure";

export class DailyBriefingBuilder {
  static async build(
    name: string
  ): Promise<DailyBriefing> {
    const context =
      ContextService.current();

    const [
      mission,
      structure,
      opportunity,
    ] = await Promise.all([
      MissionService.current(),

      MarketStructureService.current(
        "GBP/USD",
        "15min",
        200
      ),

      OpportunityService.current(
        "GBP/USD"
      ),
    ]);

    return {
      generatedAt:
        new Date().toISOString(),

      greeting:
        `Good ${this.dayPeriod()}, ${name}.`,

      /*
       * Temporary until the real Focus Score
       * engine is connected.
       *
       * This value must eventually come from
       * the Focus Score domain rather than being
       * hardcoded.
       */
      focusScore: 88,

      marketSummary: {
        title:
          "Market Summary",

        content:
          `${context.summary} ` +
          `Current market structure: ` +
          `${structure.structure}. ` +
          `Higher-timeframe bias: ` +
          `${structure.higherTimeframeBias}.`,
      },

      mission: {
        title:
          mission.title,

        content:
          mission.description,
      },

      opportunity: {
        title:
          "Best Opportunity",

        content:
          `${opportunity.symbol} is currently ` +
          `${opportunity.state} with ` +
          `${opportunity.confidence}% confidence.`,
      },

      risk: {
        title:
          "Risk Alert",

        content:
          context.isMarketOpen
            ? "Market is open. Follow your trading plan and wait for confirmation before entering."
            : "Market is currently closed. Prepare your watchlist for the next trading session.",
      },

      growth: {
        title:
          "Growth Insight",

        content:
          "Continue improving your patience by waiting for candle confirmation before every entry.",
      },

      economicEvents: {
        title:
          "Economic Events",

        content:
          "No major scheduled events in the immediate term.",
      },

      closing:
        "Trade with discipline. Consistency beats intensity.",
    };
  }

  private static dayPeriod(): string {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Morning";
    }

    if (hour < 18) {
      return "Afternoon";
    }

    return "Evening";
  }
}