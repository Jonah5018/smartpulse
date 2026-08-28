import type { LiquidityAnalysis } from "@/lib/liquidity";
import type { MarketStructureState } from "@/lib/market-structure";
import type { LiquidityNarrativeAnalysis } from "./liquidity-narrative-types";

export class LiquidityNarrativeAnalyzer {
  static analyze(
    symbol: string,
    liquidity: LiquidityAnalysis,
    structure: MarketStructureState
  ): LiquidityNarrativeAnalysis {
    const sweep = liquidity.latestSweep;
    const isBullish = String(structure) === "bullish";
    const isBearish = String(structure) === "bearish";

    if (
      sweep &&
      sweep.side === "sell_side" &&
      isBullish
    ) {
      return {
        symbol,
        timeframe: "15min",
        narrative: "sell_side_swept",
        confidence: 92,
        bullishContinuation: true,
        bearishContinuation: false,
        summary:
          "Sell-side liquidity has been swept before bullish continuation.",
      };
    }

    if (
      sweep &&
      sweep.side === "buy_side" &&
      isBearish
    ) {
      return {
        symbol,
        timeframe: "15min",
        narrative: "buy_side_swept",
        confidence: 91,
        bullishContinuation: false,
        bearishContinuation: true,
        summary:
          "Buy-side liquidity has been swept before bearish continuation.",
      };
    }

    return {
      symbol,
      timeframe: "15min",
      narrative: "expansion",
      confidence: 60,
      bullishContinuation: isBullish,
      bearishContinuation: isBearish,
      summary:
        "Price is expanding without a confirmed liquidity sweep.",
    };
  }
}