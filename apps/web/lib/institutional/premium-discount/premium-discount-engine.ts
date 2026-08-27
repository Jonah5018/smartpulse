import type { MarketCandle } from "@/lib/market";
import type { MarketStructureAnalysis } from "@/lib/market-structure";
import type { PremiumDiscountArray } from "./premium-discount-types";
import { PremiumDiscountUtils } from "./premium-discount-utils";

export class PremiumDiscountEngine {
  static analyze(
    candles: MarketCandle[],
    structure: MarketStructureAnalysis
  ): PremiumDiscountArray {
    const current =
      candles[candles.length - 1];

    const swingHigh =
      structure.swingHigh?.price ??
      current.high;

    const swingLow =
      structure.swingLow?.price ??
      current.low;

    const equilibrium =
      PremiumDiscountUtils.midpoint(
        swingHigh,
        swingLow
      );

    const zone =
      current.close > equilibrium
        ? "premium"
        : current.close < equilibrium
          ? "discount"
          : "equilibrium";

    return {
      swingHigh,
      swingLow,
      equilibrium,
      currentPrice: current.close,
      zone,
    };
  }
}