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
  it("continues crypto analysis while Forex is closed", async () => {
    vi.setSystemTime(new Date("2026-09-19T12:00:00Z"));
    vi.mocked(MarketRepository.getQuotes).mockResolvedValue([{ symbol: "BTC/USD", name: "Bitcoin", price: 60000, changePercent: 1, bid: null, ask: null, timestamp: new Date().toISOString() }]);
    const result = await LoadMarketPulse.execute();
    expect(result.session.isOpen).toBe(false);
    expect(result.dataStatus.available).toBe(true);
    expect(result.pulse.isLive).toBe(true);
    expect(MarketScannerService.current).toHaveBeenCalledOnce();
    expect(vi.mocked(MarketRepository.getQuotes).mock.calls[0][0].sort()).toEqual(["BTC/USD", "ETH/USD"]);
  });
});
