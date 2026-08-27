import type {
  MarketCandle,
} from "@/lib/market";

export class MarketStructureUtils {
  static isSwingHigh(
    candles: MarketCandle[],
    index: number
  ): boolean {
    if (
      index === 0 ||
      index === candles.length - 1
    ) {
      return false;
    }

    return (
      candles[index].high >
        candles[index - 1].high &&
      candles[index].high >
        candles[index + 1].high
    );
  }

  static isSwingLow(
    candles: MarketCandle[],
    index: number
  ): boolean {
    if (
      index === 0 ||
      index === candles.length - 1
    ) {
      return false;
    }

    return (
      candles[index].low <
        candles[index - 1].low &&
      candles[index].low <
        candles[index + 1].low
    );
  }
}