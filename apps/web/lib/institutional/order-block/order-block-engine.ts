import type { MarketCandle } from "@/lib/market";

import type { MarketStructureAnalysis } from "@/lib/market-structure";

import type { OrderBlock } from "./order-block-types";

import { OrderBlockUtils } from "./order-block-utils";

export class OrderBlockEngine {
  static analyze(
    candles: MarketCandle[],
    structure: MarketStructureAnalysis
  ): OrderBlock {
    if (candles.length < 6) {
      return this.empty();
    }

    const breakIndex = structure.brokenAt
      ? candles.findIndex(
          (candle) => candle.timestamp === structure.brokenAt
        )
      : -1;

    const breakDirection =
      breakIndex >= 0 && structure.brokenLevel !== null
        ? candles[breakIndex].close > structure.brokenLevel
          ? "bullish"
          : "bearish"
        : null;

    if (
      structure.latestEvent === "none" ||
      breakIndex < 0 ||
      breakDirection === null
    ) {
      return this.empty();
    }

    if (breakDirection === "bullish") {
      for (let i = breakIndex - 1; i >= 0; i--) {
        const candle = candles[i];

        if (OrderBlockUtils.isBearish(candle)) {
          return {
            detected: true,
            direction: "bullish",
            low: candle.low,
            high: candle.high,
            midpoint:
              (candle.low + candle.high) / 2,
            candleIndex: i,
            confidence: 80,
          };
        }
      }
    }

    if (breakDirection === "bearish") {
      for (let i = breakIndex - 1; i >= 0; i--) {
        const candle = candles[i];

        if (OrderBlockUtils.isBullish(candle)) {
          return {
            detected: true,
            direction: "bearish",
            low: candle.low,
            high: candle.high,
            midpoint:
              (candle.low + candle.high) / 2,
            candleIndex: i,
            confidence: 80,
          };
        }
      }
    }

    return this.empty();
  }

  private static empty(): OrderBlock {
    return {
      detected: false,
      direction: null,
      low: null,
      high: null,
      midpoint: null,
      candleIndex: null,
      confidence: 0,
    };
  }
}