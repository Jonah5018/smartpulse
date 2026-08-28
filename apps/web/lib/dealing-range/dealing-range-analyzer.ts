import type { MarketCandle } from "@/lib/market";
import type { DealingRangeAnalysis } from "./dealing-range-types";

export class DealingRangeAnalyzer {
  static analyze(
    symbol: string,
    candles: MarketCandle[]
  ): DealingRangeAnalysis {
    if (candles.length < 20) {
      throw new Error(
        "Not enough candles for dealing range analysis."
      );
    }

    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);

    const swingHigh = Math.max(...highs);
    const swingLow = Math.min(...lows);

    const current =
      candles[candles.length - 1].close;

    const range = swingHigh - swingLow;

    const equilibrium =
      swingLow + range * 0.5;

    const oteLow =
      swingLow + range * 0.62;

    const oteHigh =
      swingLow + range * 0.79;

    const location =
      current > equilibrium
        ? "premium"
        : current < equilibrium
        ? "discount"
        : "equilibrium";

    const inOTE =
      current >= oteLow &&
      current <= oteHigh;

    const premiumPercentage = Number(
      (((current - equilibrium) / range) * 100).toFixed(1)
    );

    const discountPercentage = Number(
      (((equilibrium - current) / range) * 100).toFixed(1)
    );

    return {
      symbol,
      timeframe: "1h",
      swingHigh,
      swingLow,
      equilibrium,
      oteHigh,
      oteLow,
      currentPrice: current,
      location,
      inOTE,
      premiumPercentage,
      discountPercentage,
      summary: this.buildSummary(location, inOTE),
    };
  }

  private static buildSummary(
    location: DealingRangeAnalysis["location"],
    inOTE: boolean
  ) {
    if (location === "discount" && inOTE) {
      return "Price is trading inside the institutional discount OTE zone.";
    }

    if (location === "premium") {
      return "Price is trading in premium relative to the H1 dealing range.";
    }

    if (location === "discount") {
      return "Price is below equilibrium and trading in discount.";
    }

    return "Price is trading around the H1 equilibrium.";
  }
}