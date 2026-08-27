import type { MarketCandle } from "@/lib/market";
import type { MarketStructureAnalysis } from "@/lib/market-structure";
import type { Displacement } from "./displacement-types";
import { DisplacementUtils } from "./displacement-utils";

export class DisplacementEngine {
  static analyze(
    candles: MarketCandle[],
    structure: MarketStructureAnalysis
  ): Displacement {
    const breakIndex = structure.brokenAt
      ? candles.findIndex(
          (candle) => candle.timestamp === structure.brokenAt
        )
      : -1;

    if (
      structure.latestEvent === "none" ||
      breakIndex < 0
    ) {
      return this.empty();
    }

    const candle =
      candles[breakIndex];

    const ratio =
      DisplacementUtils.bodyRatio(candle);

    const impulse =
      DisplacementUtils.range(candle);

    const detected =
      ratio >= 0.7;

    return {
      detected,
      direction: detected
        ? candle.close > (structure.brokenLevel ?? candle.close)
          ? "bullish"
          : "bearish"
        : null,
      strength: Math.round(ratio * 100),
      bodyRatio: Number(ratio.toFixed(2)),
      impulseSize: Number(impulse.toFixed(5)),
      candleIndex: breakIndex,
    };
  }

  private static empty(): Displacement {
    return {
      detected: false,
      direction: null,
      strength: 0,
      bodyRatio: 0,
      impulseSize: 0,
      candleIndex: null,
    };
  }
}