import type {
  DailyBriefing,
} from "./daily-briefing-types";

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

import {
  MacroBriefBuilder,
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

export class DailyBriefingBuilder {
  static build(
    name: string,
    market: DailyBriefingMarketContext,
    macro: MacroAnalysisResult
  ): DailyBriefing {
    const {
      session,
      topFocus,
      marketSelection,
    } = market;

    const selectedCandidate =
      marketSelection.bestOpportunity;

    const opportunity =
      selectedCandidate?.opportunity ??
      null;

    const marketIsOpen =
      session.isOpen;

    const focusScore =
      marketIsOpen &&
      topFocus
        ? topFocus.score
        : null;

    const greeting =
      `Good ${this.dayPeriod()}, ${name}.`;

    const macroBrief =
      MacroBriefBuilder.build(macro);

    if (!marketIsOpen) {
      return {
        generatedAt:
          new Date().toISOString(),

        greeting,

        focusScore: null,

        marketSummary: {
          title: "Market Summary",
          content:
            `${session.description} Live institutional analysis is paused until the next trading session.`,
        },

        mission: {
          title:
            "Today's Trading Mission",
          content:
            "Prepare your watchlist and review your trading plan before the next trading session.",
        },

        opportunity: {
          title:
            "Best Opportunity",
          content:
            "No live opportunity is currently available because the market is closed.",
        },

        risk: {
          title: "Risk Alert",
          content:
            "The market is currently closed. Do not treat the last available market data as a current trading opportunity.",
        },

        growth: {
          title:
            "Growth Insight",
          content:
            "Use the closed-market period to review previous setups, refine your risk management, and prepare for the next session.",
        },

        economicEvents: {
          title:
            "Economic Events",
          content:
            `${macroBrief.headline} ${macroBrief.summary}`,
        },

        closing:
          "Protect capital first. Prepare carefully and wait for the next valid market opportunity.",
      };
    }

    const opportunitySummary =
      opportunity
        ? `${opportunity.symbol} is currently ${opportunity.state} with ${opportunity.confidence}% confidence.`
        : "No qualifying live opportunity is currently available.";

    const structureSummary =
      opportunity
        ? `Current market structure: ${opportunity.structure}. Higher-timeframe bias: ${opportunity.higherTimeframeBias}.`
        : "No qualifying institutional market structure is currently available.";

    const sourceLabel =
      selectedCandidate?.source ===
      "discovery"
        ? "SmartPulse Discovery"
        : "Watchlist Opportunity";

    return {
      generatedAt:
        new Date().toISOString(),

      greeting,

      focusScore,

      marketSummary: {
        title: "Market Summary",
        content:
          `${session.description} ${structureSummary}`,
      },

      mission: {
        title:
          "Today's Trading Mission",
        content:
          opportunity
            ? `${opportunity.symbol} is SmartPulse's highest-priority market (${sourceLabel}). Wait for confirmation before taking action.`
            : "Monitor the active market universe and wait for a qualified institutional opportunity.",
      },

      opportunity: {
        title:
          "Best Opportunity",
        content:
          opportunitySummary,
      },

      risk: {
        title: "Risk Alert",
        content:
          "Market is open. Follow your trading plan and wait for confirmation before entering.",
      },

      growth: {
        title:
          "Growth Insight",
        content:
          "Continue improving your patience by waiting for confirmation before every entry.",
      },

      economicEvents: {
        title:
          "Economic Events",
        content:
          `${macroBrief.headline} ${macroBrief.summary}`,
      },

      closing:
        "Trade with discipline. Consistency beats intensity.",
    };
  }

  private static dayPeriod(): string {
    const hour =
      new Date().getHours();

    if (hour < 12)
      return "Morning";

    if (hour < 18)
      return "Afternoon";

    return "Evening";
  }
}