import type {
  MarketCandle,
} from "@/lib/market";

import type {
  DealingRangeAnalysis,
} from "./dealing-range-types";

export class DealingRangeAnalyzer {
  /**
   * Number of H1 candles used to derive the
   * current external dealing range.
   *
   * 80 H1 candles ≈ 3–4 trading days.
   */
  private static readonly LOOKBACK = 80;

  static analyze(
    symbol: string,
    candles: MarketCandle[]
  ): DealingRangeAnalysis {
    if (candles.length < 20) {
      throw new Error(
        "Not enough candles for dealing range analysis."
      );
    }

    const window =
      candles.slice(
        -Math.min(
          this.LOOKBACK,
          candles.length
        )
      );

    const swingHigh = Math.max(
      ...window.map((c) => c.high)
    );

    const swingLow = Math.min(
      ...window.map((c) => c.low)
    );

    const currentPrice =
      candles[candles.length - 1].close;

    const range =
      swingHigh - swingLow;

    if (range <= 0) {
      throw new Error(
        "Invalid dealing range."
      );
    }

    const equilibrium =
      swingLow + range * 0.5;

    /*
     * ICT Optimal Trade Entry
     * 62% – 79%
     */
    const oteLow =
      swingLow + range * 0.62;

    const oteHigh =
      swingLow + range * 0.79;

    const distanceFromLow =
      ((currentPrice - swingLow) /
        range) *
      100;

    const location =
      this.resolveLocation(
        currentPrice,
        equilibrium,
        range
      );

    const inOTE =
      currentPrice >= oteLow &&
      currentPrice <= oteHigh;

    const premiumPercentage = Number(
      Math.max(
        0,
        distanceFromLow - 50
      ).toFixed(1)
    );

    const discountPercentage = Number(
      Math.max(
        0,
        50 - distanceFromLow
      ).toFixed(1)
    );

    return {
      symbol,

      timeframe: "1h",

      swingHigh,

      swingLow,

      equilibrium,

      oteHigh,

      oteLow,

      currentPrice,

      location,

      inOTE,

      premiumPercentage,

      discountPercentage,

      summary:
        this.buildSummary(
          location,
          inOTE,
          premiumPercentage,
          discountPercentage
        ),
    };
  }

  /**
   * Treat prices within ±1% of the range
   * around equilibrium as equilibrium.
   */
  private static resolveLocation(
    current: number,
    equilibrium: number,
    range: number
  ): DealingRangeAnalysis["location"] {
    const tolerance =
      range * 0.01;

    if (
      Math.abs(
        current - equilibrium
      ) <= tolerance
    ) {
      return "equilibrium";
    }

    return current > equilibrium
      ? "premium"
      : "discount";
  }

  private static buildSummary(
    location: DealingRangeAnalysis["location"],
    inOTE: boolean,
    premium: number,
    discount: number
  ): string {
    if (
      location === "discount" &&
      inOTE
    ) {
      return `Price is trading inside the H1 discount OTE zone (${discount}% below equilibrium), favouring bullish continuation if lower-timeframe confirmation appears.`;
    }

    if (
      location === "discount"
    ) {
      return `Price is trading ${discount}% below equilibrium inside the H1 dealing range.`;
    }

    if (
      location === "premium"
    ) {
      return `Price is trading ${premium}% above equilibrium inside the H1 dealing range.`;
    }

    return "Price is trading around H1 equilibrium, indicating a balanced dealing range.";
  }
}