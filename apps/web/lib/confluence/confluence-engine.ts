import type {
  FocusScore,
} from "@/lib/focus-score";

import type {
  LiquidityAnalysis,
} from "@/lib/liquidity";

import type {
  RegimeAnalysis,
} from "@/lib/market-regime";

import type {
  MacroContext,
} from "@/lib/macro";

import type {
  ConfluenceMatrix,
} from "./confluence-types";

export class ConfluenceEngine {
  static calculate(
    focus: FocusScore,
    liquidity: LiquidityAnalysis,
    regime: RegimeAnalysis,
    macro: MacroContext
  ): ConfluenceMatrix {
    const structure =
      Math.min(35, Math.round(focus.score * 0.35));

    const liquidityScore =
      liquidity.highestPriority?.targetScore ?? 0;

    const liquidityValue =
      Math.min(
        25,
        Math.round(liquidityScore * 0.25)
      );

    const regimeValue =
      regime.confidence === 0 ? 0 : regime.regime === "trend"
        ? 15
        : regime.regime === "range"
        ? 10
        : regime.regime === "transition"
        ? 6
        : 3;

    const macroValue =
      Math.round(macro.confidence * 15);

    const execution =
      focus.score >= 90
        ? 10
        : focus.score >= 80
        ? 8
        : focus.score >= 70
        ? 6
        : 4;

    const score =
      structure +
      liquidityValue +
      regimeValue +
      macroValue +
      execution;

    return {
      score,

      level:
        this.level(score),

      breakdown: {
        structure,

        liquidity:
          liquidityValue,

        regime: regimeValue,

        macro: macroValue,

        execution,
      },

      institutionalSummary:
        this.summary(score),
    };
  }

  private static level(
    score: number
  ) {
    if (score >= 90)
      return "exceptional";

    if (score >= 75)
      return "strong";

    if (score >= 55)
      return "moderate";

    return "weak";
  }

  private static summary(
    score: number
  ) {
    if (score >= 90) {
      return "Multiple institutional factors are aligned. This is an exceptionally high-conviction environment.";
    }

    if (score >= 75) {
      return "Most institutional factors are aligned, producing a strong trading environment.";
    }

    if (score >= 55) {
      return "The market shows mixed institutional alignment. Confirmation remains important.";
    }

    return "Institutional confluence is weak. Capital preservation is preferable.";
  }
}
