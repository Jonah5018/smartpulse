import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadMarketPulse } from "./load-market-pulse";
import { MarketRepository } from "@/lib/repositories/market";
import { MarketScannerService } from "@/lib/market-scanner";
import { InstitutionalSetupService } from "@/lib/institutional-setup";
import { EconomicCalendarAnalysisService } from "@/lib/economic-calendar";
import { createSetup } from "@/lib/testing/institutional-setup-fixture";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-16T12:00:00Z"));
  vi.spyOn(MarketScannerService, "current").mockResolvedValue([]);
  vi.spyOn(MarketRepository, "getQuotes").mockResolvedValue([{
    symbol: "GBP/USD", name: "Pound", price: 1.3, changePercent: 1,
    bid: null, ask: null, timestamp: new Date().toISOString(),
  }]);
  vi.spyOn(InstitutionalSetupService, "current").mockImplementation(async symbol => createSetup({ symbol }));
  vi.spyOn(EconomicCalendarAnalysisService, "risk").mockResolvedValue({
    hasRisk: false, impact: "low", event: null, message: "No upcoming risk.", daysUntil: null,
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe("dashboard market availability", () => {
  it("accepts live prices without manufacturing bid/ask spreads", async () => {
    const result = await LoadMarketPulse.execute(["GBPUSD"]);
    expect(result.dataStatus.available).toBe(true);
    expect(result.quotes).toEqual([]);
    expect(result.topFocus).not.toBeNull();
  });
  it("does not fetch live opportunities while the market is closed", async () => {
    vi.setSystemTime(new Date("2026-09-19T12:00:00Z"));
    const result = await LoadMarketPulse.execute();
    expect(result.session.isOpen).toBe(false);
    expect(result.dataStatus.available).toBe(false);
    expect(result.topFocus).toBeNull();
    expect(MarketScannerService.current).not.toHaveBeenCalled();
    expect(MarketRepository.getQuotes).not.toHaveBeenCalled();
  });
});
