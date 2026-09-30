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

    const history = candles.slice(Math.max(0, breakIndex - 20), breakIndex);
    const averageRange = history.reduce((sum, item) => sum + item.high - item.low, 0) / Math.max(history.length, 1);
    const averageBody = history.reduce((sum, item) => sum + Math.abs(item.close - item.open), 0) / Math.max(history.length, 1);
    const body = Math.abs(candle.close - candle.open);
    const closeQuality = candle.high === candle.low ? 0 :
      candle.close > candle.open ? (candle.close - candle.low) / impulse : (candle.high - candle.close) / impulse;
    const detected = history.length >= 5 && ratio >= 0.7 && closeQuality >= 0.8 &&
      impulse >= averageRange * 1.35 && body >= averageBody * 1.5;

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