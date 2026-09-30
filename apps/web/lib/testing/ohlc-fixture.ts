import type { CandleInterval, MarketCandle } from "@/lib/market";
import type { MarketStructureAnalysis } from "@/lib/market-structure";

/** Deterministic OHLC fixtures; never used as fallback market data. */
export function bar(index: number, values: Partial<MarketCandle> = {}): MarketCandle {
  return {
    symbol: "GBP/USD",
    interval: "15min",
    timestamp: new Date(Date.UTC(2026, 8, 28) + index * 900_000).toISOString(),
    open: 100,
    high: 101,
    low: 99,
    close: 100.3,
    ...values,
  };
}

export function waveCandles(drift = 0.1, count = 100, scale = 1): MarketCandle[] {
  return Array.from({ length: count }, (_, index) => {
    const center = 100 + index * drift + Math.sin((index * Math.PI) / 6) * 3;

    return bar(index, {
      open: (center - 0.2) * scale,
      close: (center + 0.2) * scale,
      high: (center + 0.5) * scale,
      low: (center - 0.5) * scale,
    });
  });
}

export function recentCandles(
  interval: CandleInterval,
  minutes: number,
  count = 200,
): MarketCandle[] {
  const end = Math.floor(Date.now() / (minutes * 60_000)) * minutes * 60_000;

  return waveCandles(0.1, count).map((candle, index) => ({
    ...candle,
    interval,
    timestamp: new Date(end - (count - index) * minutes * 60_000).toISOString(),
  }));
}

export function structureFixture(
  overrides: Partial<MarketStructureAnalysis> = {},
): MarketStructureAnalysis {
  return {
    trend: "bullish",
    structure: "impulse",
    latestEvent: "none",
    higherTimeframeBias: "bullish",
    confidence: 75,
    swingHigh: { price: 110, time: bar(5).timestamp, type: "high", classification: "HH" },
    swingLow: { price: 90, time: bar(10).timestamp, type: "low", classification: "HL" },
    brokenLevel: null,
    brokenAt: null,
    timeframe: "15min",
    candleCount: 30,
    swings: [],
    summary: "Confirmed swing structure.",
    explanation: "Fixture with established swings.",
    ...overrides,
  };
}
