import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAnalysisContext } from "./analysis-context";
import { InstitutionalSetupEngine } from "./institutional-setup-engine";
import { MarketRepository } from "@/lib/repositories/market";
import { MarketStructureService } from "@/lib/market-structure";
import { MultiTimeframeAnalyzer } from "@/lib/multi-timeframe/multi-timeframe-analyzer";
import { INTRADAY_PROFILE } from "@/lib/multi-timeframe";
import { bar, recentCandles, structureFixture } from "@/lib/testing/ohlc-fixture";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-28T12:00:00Z"));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("shared analysis context", () => {
  it("deduplicates mandatory frames and excludes the unclosed bar", async () => {
    const candles = recentCandles("15min", 15);
    const fetch = vi
      .spyOn(MarketRepository, "getCandles")
      .mockResolvedValue([...candles, bar(201, { timestamp: new Date().toISOString() })]);
    const result = await loadAnalysisContext("GBPUSD", ["15min", "15min"], 200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result["15min"]!.candles).toHaveLength(200);
    expect(result["15min"]!.external.swings).toBeDefined();
  });

  it("rejects insufficient, stale and missing required history", async () => {
    const fetch = vi.spyOn(MarketRepository, "getCandles").mockResolvedValue([bar(0)]);
    await expect(loadAnalysisContext("GBPUSD", ["15min"], 200)).rejects.toThrow(
      "Insufficient",
    );
    fetch.mockResolvedValue(
      recentCandles("15min", 15).map((candle) => ({
        ...candle,
        timestamp: new Date(Date.parse(candle.timestamp) - 86_400_000).toISOString(),
      })),
    );
    await expect(loadAnalysisContext("GBPUSD", ["15min"], 200)).rejects.toThrow("Stale");
    fetch.mockRejectedValue(new Error("Provider unavailable"));
    await expect(loadAnalysisContext("GBPUSD", ["1h"], 200)).rejects.toThrow(
      "Provider unavailable",
    );
  });

  it("runs real APA/ICT engines from three datasets without optional M5 or duplicate H4 requests", async () => {
    const minutes = { "4h": 240, "1h": 60, "15min": 15 };
    const fetch = vi
      .spyOn(MarketRepository, "getCandles")
      .mockImplementation(async (_symbol, interval) =>
        recentCandles(interval, minutes[interval as keyof typeof minutes]),
      );
    const result = await InstitutionalSetupEngine.current("GBPUSD");
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls.map((call) => call[1]).sort()).toEqual(["15min", "1h", "4h"]);
    expect(result.priceAction).toBeDefined();
    expect(result.explainability?.narrative).toBe(result.priceAction?.narrative);
    expect(result.state).not.toBe("ready");
  });
});

describe("prepared multi-timeframe reasoning", () => {
  it.each(["bullish", "bearish"] as const)(
    "retains aligned %s context without fetching again",
    async (trend) => {
      const fetch = vi.spyOn(MarketStructureService, "current");
      const prepared = Object.fromEntries(
        ["4h", "1h", "15min"].map((frame) => [frame, structureFixture({ trend })]),
      );
      const result = await MultiTimeframeAnalyzer.analyze(
        "GBPUSD",
        INTRADAY_PROFILE,
        prepared,
      );
      expect(result.directionalBias).toBe(trend);
      expect(result.alignment).toBe("aligned");
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("keeps Daily identity and higher timeframe authority over lower noise", async () => {
    const bearish = structureFixture({ trend: "bearish" });
    const result = await MultiTimeframeAnalyzer.analyze(
      "GBPUSD",
      {
        timeframes: { context: "1day", structure: "1h", execution: "15min" },
      },
      { "1day": structureFixture(), "4h": bearish, "1h": bearish, "15min": bearish },
    );
    expect(result.context.timeframe).toBe("1day");
    expect(result.directionalBias).toBe("bullish");
    expect(result.alignment).not.toBe("aligned");
  });
});
