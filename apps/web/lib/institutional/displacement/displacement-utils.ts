import type { MarketCandle } from "@/lib/market";

export class DisplacementUtils {
  static body(candle: MarketCandle) {
    return Math.abs(
      candle.close - candle.open
    );
  }

  static range(candle: MarketCandle) {
    return candle.high - candle.low;
  }

  static bodyRatio(candle: MarketCandle) {
    const range = this.range(candle);

    if (range === 0) return 0;

    return this.body(candle) / range;
  }
}