import {
  MarketDataService,
} from "@/lib/providers/market-data";

import {
  MarketDataError,
} from "@/lib/providers/market-data";

import type {
  LiveMarketQuote,
} from "@/lib/providers/market-data";

import type {
  CandleInterval,
  MarketCandle,
} from "@/lib/market";

import {
  MarketCache,
} from "@/lib/cache";

export class MarketRepository {
  private static quoteCache =
    new Map<
      string,
      {
        data: LiveMarketQuote[];
        expiresAt: number;
      }
    >();

  private static candleCache =
    new Map<
      string,
      {
        data: MarketCandle[];
        expiresAt: number;
      }
    >();

  /*
   * In-flight requests prevent multiple callers
   * from requesting the same provider resource
   * simultaneously.
   */
  private static quoteRequests =
    new Map<
      string,
      Promise<LiveMarketQuote[]>
    >();

  private static candleRequests =
    new Map<
      string,
      Promise<MarketCandle[]>
    >();

  /*
   * Provider cooldown.
   *
   * When Twelve Data returns HTTP 429, SmartPulse
   * temporarily stops making new provider requests.
   *
   * Cached data can still be returned while the
   * provider is cooling down.
   */
  private static providerCooldownUntil =
    0;

  private static readonly QUOTE_CACHE_DURATION =
    60 * 1000;

  private static readonly CANDLE_CACHE_DURATION =
    60 * 1000;

  private static readonly PROVIDER_COOLDOWN_DURATION =
    60 * 1000;

  /**
   * Check whether the market-data provider is
   * currently in a local cooldown period.
   */
  private static isProviderCoolingDown(): boolean {
    return (
      Date.now() <
      this.providerCooldownUntil
    );
  }

  /**
   * Mark the provider as temporarily unavailable.
   */
  private static markProviderRateLimited(
    error: MarketDataError
  ): void {
    if (
      error.status !== 429
    ) {
      return;
    }

    this.providerCooldownUntil =
      Date.now() +
      this.PROVIDER_COOLDOWN_DURATION;
  }

  /**
   * Create a consistent rate-limit error when
   * SmartPulse blocks a request locally.
   */
  private static createCooldownError():
    MarketDataError {
    const remaining =
      Math.max(
        0,
        Math.ceil(
          (
            this.providerCooldownUntil -
            Date.now()
          ) / 1000
        )
      );

    return new MarketDataError(
      `Market data provider is temporarily rate-limited. Retry in approximately ${remaining} seconds.`,
      {
        status: 429,
        provider:
          "twelve-data",
        retryable: true,
      }
    );
  }

  /**
   * Get live market quotes.
   *
   * Quotes are cached for 60 seconds.
   *
   * Simultaneous requests for the same symbol
   * collection share one provider request.
   *
   * If Twelve Data returns 429, SmartPulse enters
   * a short provider cooldown and avoids making
   * additional requests during that period.
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

    const now =
      Date.now();

    /*
     * ------------------------------------------------
     * COMPLETED CACHE
     * ------------------------------------------------
     *
     * Always prefer valid cached data.
     *
     * This means a temporary provider outage does
     * not automatically destroy recently available
     * market information.
     */

    const cached =
      this.quoteCache.get(
        cacheKey
      );

    if (
      cached &&
      now < cached.expiresAt
    ) {
      return cached.data;
    }

    /*
     * ------------------------------------------------
     * PROVIDER COOLDOWN
     * ------------------------------------------------
     */

    if (
      this.isProviderCoolingDown()
    ) {
      throw this.createCooldownError();
    }

    /*
     * ------------------------------------------------
     * IN-FLIGHT REQUEST
     * ------------------------------------------------
     */

    const existingRequest =
      this.quoteRequests.get(
        cacheKey
      );

    if (existingRequest) {
      return existingRequest;
    }

    /*
     * ------------------------------------------------
     * PROVIDER REQUEST
     * ------------------------------------------------
     */

    const request =
      MarketDataService.quotes(
        normalizedSymbols
      )
        .then((quotes) => {
          this.quoteCache.set(
            cacheKey,
            {
              data: quotes,
              expiresAt:
                Date.now() +
                this.QUOTE_CACHE_DURATION,
            }
          );

          return quotes;
        })
        .catch((error) => {
          if (
            error instanceof
              MarketDataError &&
            error.status === 429
          ) {
            this.markProviderRateLimited(
              error
            );
          }

          throw error;
        })
        .finally(() => {
          this.quoteRequests.delete(
            cacheKey
          );
        });

    this.quoteRequests.set(
      cacheKey,
      request
    );

    return request;
  }

  /**
   * Get historical OHLC candles.
   *
   * Candle data is cached for 60 seconds.
   *
   * Simultaneous requests for the same
   * symbol, interval and output size share
   * one provider request.
   *
   * The same provider cooldown used by quotes
   * also protects candle requests.
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

    const cacheKey =
      [
        normalizedSymbol,
        interval,
        outputsize,
      ].join("|");

    const now =
      Date.now();

    /*
     * ------------------------------------------------
     * COMPLETED CACHE
     * ------------------------------------------------
     */

    const cached =
      MarketCache.get(
        normalizedSymbol,
        interval
    );

    if (cached) {
      return cached;
   }

    /*
     * ------------------------------------------------
     * PROVIDER COOLDOWN
     * ------------------------------------------------
     */

    if (
      this.isProviderCoolingDown()
    ) {
      throw this.createCooldownError();
    }

    /*
     * ------------------------------------------------
     * IN-FLIGHT REQUEST
     * ------------------------------------------------
     */

    const existingRequest =
      this.candleRequests.get(
        cacheKey
      );

    if (existingRequest) {
      return existingRequest;
    }

    /*
     * ------------------------------------------------
     * PROVIDER REQUEST
     * ------------------------------------------------
     */

    const candleRequest =
      MarketDataService.candles(
        normalizedSymbol,
        interval,
        outputsize
      )
        .then((candles) => {
          MarketCache.set(
            normalizedSymbol,
            interval,
            candles
        );

        return candles;
      })
        .catch((error) => {
          if (
            error instanceof MarketDataError &&
            error.status === 429
          ) {
            this.markProviderRateLimited(error);

            const fallback = MarketCache.get(
              normalizedSymbol,
              interval
            );

            if (fallback) {
              return fallback;
            }
          }

          throw error;
        })
        .finally(() => {
          this.candleRequests.delete(
            cacheKey
          );
        });

    this.candleRequests.set(
      cacheKey,
      candleRequest
    );

    return candleRequest;
  }

  /**
   * Clear all completed cache,
   * in-flight request and provider cooldown state.
   */
  static clearCache(): void {
    this.quoteCache.clear();

    this.candleCache.clear();

    this.quoteRequests.clear();

    this.candleRequests.clear();

    this.providerCooldownUntil =
      0;
    MarketCache.clear();
  }
}