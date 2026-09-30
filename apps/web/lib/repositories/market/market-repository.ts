import { MarketDataService, MarketDataError } from "@/lib/providers/market-data";
import type { LiveMarketQuote } from "@/lib/providers/market-data";
import type { CandleInterval, MarketCandle } from "@/lib/market";
import { findInstrument } from "@/lib/market/market-universe";
import { MarketCache } from "@/lib/cache";
import { RequestBudget } from "@/lib/providers/market-data/request-budget";

interface QuoteCacheEntry {
  data: LiveMarketQuote;
  expiresAt: number;
}

export class MarketRepository {
  private static quoteCache = new Map<string, QuoteCacheEntry>();
  private static quoteRequests = new Map<string, Promise<LiveMarketQuote>>();
  private static candleRequests = new Map<string, Promise<MarketCandle[]>>();
  private static budget = new RequestBudget();

  private static instrument(symbol: string) {
    const instrument = findInstrument(symbol);

    if (!instrument?.enabled || !instrument.providerSymbols.twelveData) {
      throw new MarketDataError("Unsupported or unavailable instrument.", {
        provider: "twelve-data",
        retryable: false,
      });
    }

    return instrument;
  }

  static async getQuotes(symbols: string[]): Promise<LiveMarketQuote[]> {
    const instruments = [
      ...new Map(
        symbols.map((symbol) => {
          const instrument = this.instrument(symbol);
          return [instrument.id, instrument] as const;
        }),
      ).values(),
    ];

    const results = await Promise.allSettled(
      instruments.map((instrument) => this.getQuote(instrument.symbol)),
    );
    const quotes = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );

    // Partial baskets stay useful. Missing instruments remain missing.
    if (quotes.length === 0) {
      const failure = results.find((result) => result.status === "rejected");
      if (failure?.status === "rejected") throw failure.reason;
    }

    return quotes;
  }

  private static async getQuote(symbol: string): Promise<LiveMarketQuote> {
    const instrument = this.instrument(symbol);
    const key = "twelveData:" + instrument.id;
    const cached = this.quoteCache.get(key);

    if (cached && Date.now() < cached.expiresAt) return cached.data;
    this.quoteCache.delete(key);

    const existing = this.quoteRequests.get(key);
    if (existing) return existing;

    const request = this.budget
      .run(() => MarketDataService.quotes([instrument.symbol]))
      .then((quotes) => {
        const quote = quotes.find(
          (item) => findInstrument(item.symbol)?.id === instrument.id,
        );

        if (!quote) {
          throw new MarketDataError(
            "Provider returned no quote for the requested instrument.",
            {
              provider: "twelve-data",
            },
          );
        }

        this.quoteCache.set(key, { data: quote, expiresAt: Date.now() + 60_000 });
        return quote;
      })
      .finally(() => this.quoteRequests.delete(key));

    this.quoteRequests.set(key, request);
    return request;
  }

  static async getCandles(
    symbol: string,
    interval: CandleInterval,
    outputsize = 200,
  ): Promise<MarketCandle[]> {
    const instrument = this.instrument(symbol);

    if (!Number.isInteger(outputsize) || outputsize < 1 || outputsize > 5000) {
      throw new MarketDataError("Candle outputsize must be between 1 and 5000.");
    }

    const key = ["twelveData", instrument.id, interval, outputsize].join("|");
    const cacheIdentity = "twelveData:" + instrument.id;
    const cached = MarketCache.get(cacheIdentity, interval, outputsize);
    if (cached) return cached;

    const existing = this.candleRequests.get(key);
    if (existing) return existing;

    const request = this.budget
      .run(() => MarketDataService.candles(instrument.symbol, interval, outputsize))
      .then((candles) => {
        MarketCache.set(cacheIdentity, interval, candles, 60, outputsize);
        return candles;
      })
      .finally(() => this.candleRequests.delete(key));

    this.candleRequests.set(key, request);
    return request;
  }

  /** Tests/maintenance only; never clear the quota on ordinary navigation. */
  static clearCache(): void {
    this.quoteCache.clear();
    this.quoteRequests.clear();
    this.candleRequests.clear();
    this.budget = new RequestBudget();
    MarketCache.clear();
  }
}
