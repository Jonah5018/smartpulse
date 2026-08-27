import type {
  MarketCandle,
} from "@/lib/market";

export class LiquidityUtils {
  /**
   * Two highs are considered equal when
   * they are within the supplied tolerance.
   *
   * Default:
   * 0.05% difference.
   */
  static nearlyEqual(
    a: number,
    b: number,
    tolerance = 0.0005
  ): boolean {
    const difference =
      Math.abs(a - b);

    const average =
      (a + b) / 2;

    return (
      difference / average <=
      tolerance
    );
  }

  static highestHigh(
    candles: MarketCandle[]
  ): number {
    return Math.max(
      ...candles.map(
        (candle) => candle.high
      )
    );
  }

  static lowestLow(
    candles: MarketCandle[]
  ): number {
    return Math.min(
      ...candles.map(
        (candle) => candle.low
      )
    );
  }
}