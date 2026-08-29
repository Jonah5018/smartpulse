import type {
  MultiTimeframeAnalysis,
} from "@/lib/multi-timeframe";

import type {
  DealingRangeAnalysis,
} from "@/lib/dealing-range";

import type {
  LiquidityNarrativeAnalysis,
} from "@/lib/liquidity-narrative";

import type {
  TopDownReport,
} from "./top-down-types";

export class TopDownAnalyzer {
  static analyze(
    symbol: string,
    mtf: MultiTimeframeAnalysis,
    range: DealingRangeAnalysis,
    liquidity: LiquidityNarrativeAnalysis
  ): TopDownReport {
    const bullishContext =
      mtf.directionalBias ===
        "bullish" &&
      range.location ===
        "discount";

    const bearishContext =
      mtf.directionalBias ===
        "bearish" &&
      range.location ===
        "premium";

    const bullish =
      bullishContext &&
      liquidity.bullishContinuation;

    const bearish =
      bearishContext &&
      liquidity.bearishContinuation;

    const decision =
      bullish
        ? "buy"
        : bearish
        ? "sell"
        : "wait";

    const confidence =
      this.calculateConfidence(
        mtf,
        range,
        liquidity,
        decision
      );

    return {
      symbol,

      higherTimeframe: mtf,

      dealingRange: range,

      liquidity,

      decision,

      confidence,

      narrative:
        this.buildNarrative(
          mtf,
          range,
          liquidity,
          decision,
          confidence
        ),
    };
  }

  /**
   * ------------------------------------------------
   * INSTITUTIONAL CONFIDENCE
   * ------------------------------------------------
   *
   * Weighting:
   * H4 Bias ............. 35%
   * H1 Dealing Range .... 25%
   * M15 Liquidity ....... 40%
   */
  private static calculateConfidence(
    mtf: MultiTimeframeAnalysis,
    range: DealingRangeAnalysis,
    liquidity: LiquidityNarrativeAnalysis,
    decision: TopDownReport["decision"]
  ): number {
    let score = 0;

    score +=
      mtf.confidence * 0.35;

    if (
      range.location ===
      "equilibrium"
    ) {
      score += 45 * 0.25;
    } else if (
      range.inOTE
    ) {
      score += 95 * 0.25;
    } else {
      score += 70 * 0.25;
    }

    score +=
      liquidity.confidence *
      0.4;

    if (decision === "wait") {
      score *= 0.78;
    }

    return Math.round(
      Math.min(99, score)
    );
  }

  /**
   * ------------------------------------------------
   * INSTITUTIONAL NARRATIVE
   * ------------------------------------------------
   */
  private static buildNarrative(
    mtf: MultiTimeframeAnalysis,
    range: DealingRangeAnalysis,
    liquidity: LiquidityNarrativeAnalysis,
    decision: TopDownReport["decision"],
    confidence: number
  ): string {
    const parts: string[] =
      [];

    // H4 Context
    parts.push(
      `H4 remains ${mtf.h4.trend}, establishing the higher-timeframe institutional bias.`
    );

    // H1 Context
    if (
      range.location ===
        "discount" &&
      range.inOTE
    ) {
      parts.push(
        `H1 is trading inside the institutional discount OTE zone (${range.discountPercentage}% below equilibrium).`
      );
    } else if (
      range.location ===
      "discount"
    ) {
      parts.push(
        `H1 is trading in discount (${range.discountPercentage}% below equilibrium).`
      );
    } else if (
      range.location ===
      "premium"
    ) {
      parts.push(
        `H1 is trading in premium (${range.premiumPercentage}% above equilibrium).`
      );
    } else {
      parts.push(
        "H1 is trading around equilibrium, suggesting a balanced dealing range."
      );
    }

    // M15 Liquidity
    parts.push(
      liquidity.summary
    );

    // Verdict
    if (decision === "buy") {
      parts.push(
        `Institutional verdict: BUY. Wait for lower-timeframe confirmation before execution. Confidence: ${confidence}%.`
      );
    } else if (
      decision === "sell"
    ) {
      parts.push(
        `Institutional verdict: SELL. Wait for bearish execution confirmation before entry. Confidence: ${confidence}%.`
      );
    } else {
      parts.push(
        `Institutional verdict: WAIT. Higher-timeframe context exists, but execution confirmation is not yet sufficient. Confidence: ${confidence}%.`
      );
    }

    return parts.join(" ");
  }
}