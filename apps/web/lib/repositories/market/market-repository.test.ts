import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketRepository } from "./market-repository";
import { MarketDataService, MarketDataError } from "@/lib/providers/market-data";
import type { MarketCandle } from "@/lib/market";

const candles: MarketCandle[] = [{
  symbol: "GBP/USD", interval: "15min", timestamp: "2026-09-16T12:00:00Z",
  open: 1.27, high: 1.28, low: 1.26, close: 1.275,
}];

beforeEach(() => {
  vi.useFakeTimers();
  MarketRepository.clearCache();
  vi.spyOn(MarketDataService, "candles").mockResolvedValue(candles);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  MarketRepository.clearCache();
});

describe("MarketRepository candle freshness", () => {
  it("shares concurrent requests and reuses fresh candles", async () => {
    await Promise.all([
      MarketRepository.getCandles(" gbp/usd ", "15min", 200),
      MarketRepository.getCandles("GBP/USD", "15min", 200),
    ]);
    await MarketRepository.getCandles("GBP/USD", "15min", 200);
    expect(MarketDataService.candles).toHaveBeenCalledTimes(1);
  });

  it("fetches new candles when the TTL expires", async () => {
    await MarketRepository.getCandles("GBP/USD", "15min", 200);
    const updated = [{ ...candles[0], close: 1.278 }];
    vi.mocked(MarketDataService.candles).mockResolvedValue(updated);
    vi.advanceTimersByTime(60_000);
    expect(await MarketRepository.getCandles("GBP/USD", "15min", 200)).toEqual(updated);
    expect(MarketDataService.candles).toHaveBeenCalledTimes(2);
  });

  it("does not reuse a different candle count", async () => {
    await MarketRepository.getCandles("GBP/USD", "15min", 20);
    await MarketRepository.getCandles("GBP/USD", "15min", 200);
    expect(MarketDataService.candles).toHaveBeenCalledTimes(2);
    expect(MarketDataService.candles).toHaveBeenLastCalledWith("GBP/USD", "15min", 200);
  });

  it("reports rate limiting instead of returning expired candles as live data", async () => {
    await MarketRepository.getCandles("GBP/USD", "15min", 200);
    vi.advanceTimersByTime(60_000);
    vi.mocked(MarketDataService.candles).mockRejectedValue(new MarketDataError("Rate limited", { status: 429 }));
    await expect(MarketRepository.getCandles("GBP/USD", "15min", 200)).rejects.toMatchObject({ status: 429 });
    await expect(MarketRepository.getCandles("GBP/USD", "15min", 200)).rejects.toMatchObject({ status: 429 });
    expect(MarketDataService.candles).toHaveBeenCalledTimes(2);
  });
});
