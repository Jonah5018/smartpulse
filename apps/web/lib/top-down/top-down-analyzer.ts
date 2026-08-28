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
    const bullish =
      mtf.directionalBias === "bullish" &&
      range.location === "discount" &&
      liquidity.bullishContinuation;

    const bearish =
      mtf.directionalBias === "bearish" &&
      range.location === "premium" &&
      liquidity.bearishContinuation;

    const decision =
      bullish
        ? "buy"
        : bearish
        ? "sell"
        : "wait";

    const confidence = Math.round(
      (mtf.confidence +
        liquidity.confidence) /
        2
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
          decision
        ),
    };
  }

  private static buildNarrative(
    mtf: MultiTimeframeAnalysis,
    range: DealingRangeAnalysis,
    liquidity: LiquidityNarrativeAnalysis,
    decision: TopDownReport["decision"]
  ) {
    return [
      `H4 bias remains ${mtf.h4.trend}.`,
      `H1 price is trading in ${range.location}.`,
      liquidity.summary,
      `Institutional decision: ${decision.toUpperCase()}.`,
    ].join(" ");
  }
}