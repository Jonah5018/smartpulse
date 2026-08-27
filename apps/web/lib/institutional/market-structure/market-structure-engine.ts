import type {
  MarketCandle,
} from "@/lib/market";

import type {
  MarketStructure,
  SwingPoint,
} from "./market-structure-types";

import {
  MarketStructureUtils,
} from "./market-structure-utils";

export class MarketStructureEngine {
  static analyze(
    candles: MarketCandle[]
  ): MarketStructure {
    const swingHighs: SwingPoint[] =
      [];

    const swingLows: SwingPoint[] =
      [];

    for (
      let i = 1;
      i < candles.length - 1;
      i++
    ) {
      if (
        MarketStructureUtils.isSwingHigh(
          candles,
          i
        )
      ) {
        swingHighs.push({
          index: i,
          price:
            candles[i].high,
          timestamp:
            candles[i].timestamp,
          type: "high",
        });
      }

      if (
        MarketStructureUtils.isSwingLow(
          candles,
          i
        )
      ) {
        swingLows.push({
          index: i,
          price:
            candles[i].low,
          timestamp:
            candles[i].timestamp,
          type: "low",
        });
      }
    }

    const trend =
      this.detectTrend(
        swingHighs,
        swingLows
      );

    const bos =
      this.detectBOS(
        candles,
        swingHighs,
        swingLows
      );

    const choch =
      this.detectCHoCH(
        trend,
        bos
      );

    return {
      trend,
      swingHighs,
      swingLows,
      bos,
      choch,
    };
  }

  private static detectTrend(
    highs: SwingPoint[],
    lows: SwingPoint[]
  ): MarketStructure["trend"] {
    if (
      highs.length < 2 ||
      lows.length < 2
    ) {
      return "range";
    }

    const h1 =
      highs[
        highs.length - 2
      ].price;

    const h2 =
      highs[
        highs.length - 1
      ].price;

    const l1 =
      lows[
        lows.length - 2
      ].price;

    const l2 =
      lows[
        lows.length - 1
      ].price;

    if (
      h2 > h1 &&
      l2 > l1
    ) {
      return "bullish";
    }

    if (
      h2 < h1 &&
      l2 < l1
    ) {
      return "bearish";
    }

    return "range";
  }

  private static detectBOS(
    candles: MarketCandle[],
    highs: SwingPoint[],
    lows: SwingPoint[]
  ): MarketStructure["bos"] {
    if (
      highs.length === 0 ||
      lows.length === 0
    ) {
      return {
        detected: false,
        direction: null,
        price: null,
        candleIndex: null,
      };
    }

    const last =
      candles[
        candles.length - 1
      ];

    const previousHigh =
      highs[
        highs.length - 1
      ].price;

    const previousLow =
      lows[
        lows.length - 1
      ].price;

    if (
      last.close >
      previousHigh
    ) {
      return {
        detected: true,
        direction:
          "bullish",
        price: previousHigh,
        candleIndex:
          candles.length - 1,
      };
    }

    if (
      last.close <
      previousLow
    ) {
      return {
        detected: true,
        direction:
          "bearish",
        price: previousLow,
        candleIndex:
          candles.length - 1,
      };
    }

    return {
      detected: false,
      direction: null,
      price: null,
      candleIndex: null,
    };
  }

  private static detectCHoCH(
    trend: MarketStructure["trend"],
    bos: MarketStructure["bos"]
  ) {
    if (
      !bos.detected ||
      !bos.direction
    ) {
      return {
        detected: false,
        direction: null,
        price: null,
        candleIndex: null,
      };
    }

    const reversal =
      (trend ===
        "bearish" &&
        bos.direction ===
          "bullish") ||
      (trend ===
        "bullish" &&
        bos.direction ===
          "bearish");

    return {
      detected: reversal,
      direction: reversal
        ? bos.direction
        : null,
      price: reversal
        ? bos.price
        : null,
      candleIndex: reversal
        ? bos.candleIndex
        : null,
    };
  }
}