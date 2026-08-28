import type {
  MarketCandle,
} from "@/lib/market";

interface Entry {
  candles: MarketCandle[];

  expires: number;

  timestamp: number;
}

export class MarketCache {
  private static store =
    new Map<string, Entry>();

  private static key(
    symbol: string,
    timeframe: string
  ) {
    return `${symbol}:${timeframe}`;
  }

  static get(
    symbol: string,
    timeframe: string
  ): MarketCandle[] | null {
    const item =
      this.store.get(
        this.key(symbol, timeframe)
      );

    if (!item) return null;

    if (Date.now() > item.expires) {
      return item.candles;
    }

    return item.candles;
  }

  static set(
    symbol: string,
    timeframe: string,
    candles: MarketCandle[],
    ttlSeconds = 60
  ) {
    this.store.set(
      this.key(symbol, timeframe),
      {
        candles,
        timestamp: Date.now(),
        expires:
          Date.now() +
          ttlSeconds * 1000,
      }
    );
  }

  static clear() {
    this.store.clear();
  }
}