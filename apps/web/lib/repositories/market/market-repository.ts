import {
  MarketDataService,
} from "@/lib/providers/market-data";

import type {
  LiveMarketQuote,
} from "@/lib/providers/market-data";

import type {
  CandleInterval,
  MarketCandle,
} from "@/lib/market";

export class MarketRepository {
  private static quoteCache =
    new Map<
      string,
      {
        data: LiveMarketQuote[];
        expiresAt: number;
      }
    >();

  private static readonly CACHE_DURATION =
    60 * 1000;

  /**
   * Get live market quotes.
   *
   * Quotes are cached for 60 seconds to
   * reduce unnecessary calls to the provider.
   */
  static async getQuotes(
    symbols: string[]
  ): Promise<LiveMarketQuote[]> {
    const normalizedSymbols =
      symbols
        .map((symbol) =>
          symbol.trim().toUpperCase()
        )
        .filter(Boolean);

    if (
      normalizedSymbols.length === 0
    ) {
      return [];
    }

    const cacheKey =
      [...normalizedSymbols]
        .sort()
        .join(",");

    const now = Date.now();

    const cached =
      this.quoteCache.get(cacheKey);

    if (
      cached &&
      now < cached.expiresAt
    ) {
      return cached.data;
    }

    const quotes =
      await MarketDataService.quotes(
        normalizedSymbols
      );

    this.quoteCache.set(
      cacheKey,
      {
        data: quotes,
        expiresAt:
          now +
          this.CACHE_DURATION,
      }
    );

    return quotes;
  }

  /**
   * Get historical OHLC candles.
   *
   * Candles are intentionally not cached here
   * because the caller may request different
   * symbols, intervals and output sizes.
   */
  static async getCandles(
    symbol: string,
    interval: CandleInterval,
    outputsize: number = 200
  ): Promise<MarketCandle[]> {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error(
        "Market symbol is required."
      );
    }

    if (
      !Number.isInteger(outputsize) ||
      outputsize <= 0
    ) {
      throw new Error(
        "outputsize must be a positive integer."
      );
    }

    return MarketDataService.candles(
      normalizedSymbol,
      interval,
      outputsize
    );
  }

  /**
   * Clear all cached market quotes.
   */
  static clearCache(): void {
    this.quoteCache.clear();
  }
}