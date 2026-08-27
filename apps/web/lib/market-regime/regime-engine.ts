// lib/market-regime/regime-engine.ts

import type { MacroContext } from "@/lib/macro";

import type {
  RegimeAnalysis,
  MarketRegime,
} from "./regime-types";

export class RegimeEngine {
  static analyze(
    macro: MacroContext
  ): RegimeAnalysis {
    const regime =
      this.classify(macro);

    return {
      regime,

      confidence:
        macro.confidence,

      title:
        this.title(regime),

      description:
        this.description(regime),

      institutionalMessage:
        this.message(
          regime,
          macro
        ),
    };
  }

  private static classify(
    macro: MacroContext
  ): MarketRegime {
    if (
      macro.bias === "bearish" &&
      macro.riskLevel === "high"
    ) {
      return "risk_off";
    }

    if (
      macro.bias === "bullish" &&
      macro.confidence >= 0.75
    ) {
      return "trend";
    }

    if (
      macro.bias === "neutral"
    ) {
      return "range";
    }

    return "transition";
  }

  private static title(
    regime: MarketRegime
  ): string {
    switch (regime) {
      case "trend":
        return "Directional Trend Regime";

      case "range":
        return "Balanced Range Regime";

      case "risk_off":
        return "Defensive Risk-Off Regime";

      case "transition":
        return "Transition Regime";
    }
  }

  private static description(
    regime: MarketRegime
  ): string {
    switch (regime) {
      case "trend":
        return "Institutional conditions favor continuation over mean reversion.";

      case "range":
        return "Liquidity is rotating inside established boundaries.";

      case "risk_off":
        return "Capital preservation dominates institutional behavior.";

      case "transition":
        return "Conflicting macro signals reduce directional conviction.";
    }
  }

  private static message(
    regime: MarketRegime,
    macro: MacroContext
  ): string {
    switch (regime) {
      case "trend":
        return `Macro bias remains ${macro.bias} with improving institutional sentiment.`;

      case "range":
        return "Market participants are awaiting stronger macro confirmation before expanding positions.";

      case "risk_off":
        return `High-impact macro risk is being driven primarily by ${macro.primaryDriver ?? "upcoming economic events"}.`;

      case "transition":
        return "Institutional conviction is mixed; patience is preferable to aggression.";
    }
  }
}