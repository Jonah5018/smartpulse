import type {
  MarketCandle,
} from "@/lib/market";

import type {
  CachedMarketData,
} from "./cache-types";

const CACHE = new Map<
  string,
  CachedMarketData
>();

const TTL_MINUTES = 5;

export class MarketCache {
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
      CACHE.get(
        this.key(symbol, timeframe)
      );

    if (!item) {
      return null;
    }

    if (
      new Date(item.expiresAt) <
      new Date()
    ) {
      CACHE.delete(
        this.key(symbol, timeframe)
      );

      return null;
    }

    return item.candles;
  }

  static set(
    symbol: string,
    timeframe: string,
    candles: MarketCandle[]
  ) {
    const now =
      new Date();

    const expires =
      new Date(
        now.getTime() +
          TTL_MINUTES *
            60 *
            1000
      );

    CACHE.set(
      this.key(symbol, timeframe),
      {
        symbol,

        timeframe,

        candles,

        updatedAt:
          now.toISOString(),

        expiresAt:
          expires.toISOString(),
      }
    );
  }

  static clear() {
    CACHE.clear();
  }
}