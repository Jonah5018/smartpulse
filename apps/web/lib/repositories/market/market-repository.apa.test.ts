import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketRepository } from "./market-repository";
import { MarketDataService, MarketDataError } from "@/lib/providers/market-data";
import { bar } from "@/lib/testing/ohlc-fixture";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("TWELVE_DATA_CREDITS_PER_MINUTE", "30");
  MarketRepository.clearCache();
});

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("shared market repository", () => {
  it("deduplicates simultaneous aliases and reuses candles until expiry", async () => {
    const fetch = vi.spyOn(MarketDataService, "candles").mockResolvedValue([bar(0)]);
    const [first, second] = await Promise.all([
      MarketRepository.getCandles("GBPUSD", "15min"),
      MarketRepository.getCandles("gbp/usd", "15min"),
    ]);
    expect(first).toBe(second);
    await MarketRepository.getCandles("GBP/USD", "15min");
    expect(fetch).toHaveBeenCalledTimes(1);
    await MarketRepository.getCandles("GBP/USD", "1h");
    await MarketRepository.getCandles("GBP/USD", "15min", 100);
    expect(fetch).toHaveBeenCalledTimes(3);
    vi.advanceTimersByTime(60_001);
    await MarketRepository.getCandles("GBP/USD", "15min");
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("shares overlapping quote baskets and keeps failures missing", async () => {
    const fetch = vi.spyOn(MarketDataService, "quotes").mockImplementation(async symbols => {
      if (symbols[0] === "ETH/USD") throw new MarketDataError("Unavailable");
      return [{ symbol: symbols[0], name: symbols[0], price: 100, changePercent: 1,
        bid: null, ask: null, timestamp: new Date().toISOString() }];
    });
    const [first, second] = await Promise.all([
      MarketRepository.getQuotes(["GBPUSD", "EURUSD"]),
      MarketRepository.getQuotes(["GBP/USD", "ETHUSD"]),
    ]);
    expect(first).toHaveLength(2);
    expect(second.map(item => item.symbol)).toEqual(["GBP/USD"]);
    expect(fetch).toHaveBeenCalledTimes(3);
    await MarketRepository.getQuotes(["GBPUSD"]);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("does not cache provider failures or admit unsupported instruments", async () => {
    const fetch = vi.spyOn(MarketDataService, "candles")
      .mockRejectedValueOnce(new MarketDataError("Unavailable"))
      .mockResolvedValue([bar(0)]);
    await expect(MarketRepository.getCandles("GBPUSD", "15min")).rejects.toThrow();
    await expect(MarketRepository.getCandles("GBPUSD", "15min")).resolves.toHaveLength(1);
    await expect(MarketRepository.getCandles("NAS100", "15min")).rejects.toThrow("Unsupported");
    await expect(MarketRepository.getQuotes(["NOTREAL"])).rejects.toThrow("Unsupported");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
