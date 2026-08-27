import type { MarketCandle } from "@/lib/market";

export class OrderBlockUtils {
  static isBullish(candle: MarketCandle) {
    return candle.close > candle.open;
  }

  static isBearish(candle: MarketCandle) {
    return candle.close < candle.open;
  }

  static bodySize(candle: MarketCandle) {
    return Math.abs(
      candle.close - candle.open
    );
  }
}