import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadMarketIntelligence } from "./load-market-intelligence";
import { InstitutionalSetupService } from "@/lib/institutional-setup";
import { EconomicCalendarAnalysisService } from "@/lib/economic-calendar";
import { LoadMacroIntelligence } from "@/lib/application/macro/load-macro-intelligence";
import { LoadLiquidityIntelligence } from "@/lib/application/liquidity/load-liquidity-intelligence";
import { OpenAIProvider } from "@/lib/ai/providers";
import { AnalysisCache } from "@/lib/analysis-cache";
import { MarketDataError } from "@/lib/providers/market-data";
import { createSetup } from "@/lib/testing/institutional-setup-fixture";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import IntelligencePage from "@/app/(protected)/intelligence/page";

vi.mock("@/lib/auth", () => ({
  requireTrader: async () => ({ profile: { favorite_markets: ["GBP/USD"] } }),
}));
vi.mock("@/components/layout/dashboard-shell", () => ({
  DashboardShell: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-16T12:00:00Z"));
  AnalysisCache.clear();
  vi.spyOn(InstitutionalSetupService, "current").mockImplementation(async (symbol) => createSetup({ symbol }));
  vi.spyOn(EconomicCalendarAnalysisService, "risk").mockResolvedValue({
    hasRisk: false, impact: "low", event: null, message: "No upcoming risk.", daysUntil: null,
  });
  vi.spyOn(LoadMacroIntelligence, "execute").mockResolvedValue({
    insights: [], overallBias: "neutral", confidence: 0, generatedAt: new Date(),
  });
  vi.spyOn(LoadLiquidityIntelligence, "execute").mockRejectedValue(new MarketDataError("Liquidity unavailable"));
  vi.spyOn(OpenAIProvider, "generate").mockResolvedValue("Institutional brief.");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  AnalysisCache.clear();
});

describe("LoadMarketIntelligence", () => {
  it("renders the journal and builds the AI prompt from real macro data", async () => {
    const result = await LoadMarketIntelligence.execute(" gbp/usd ", ["GBP/USD"]);
    expect(result.symbol).toBe("GBP/USD");
    expect(result.tradeJournal?.title).toBe("BUY execution plan is ready");
    expect(result.aiBrief).toBe("Institutional brief.");
    expect(OpenAIProvider.generate).toHaveBeenCalledWith(expect.any(String), expect.stringContaining("OVERALL MACRO BIAS:\nneutral"));
    expect(LoadMacroIntelligence.execute).toHaveBeenCalledTimes(1);
  });

  it("keeps the requested journal when a discovery market fails", async () => {
    vi.mocked(InstitutionalSetupService.current).mockImplementation(async (symbol) => {
      if (symbol !== "GBP/USD") throw new MarketDataError("Provider limit", { status: 429 });
      return createSetup({ symbol });
    });
    const result = await LoadMarketIntelligence.execute("GBP/USD");
    expect(result.tradeJournal?.symbol).toBe("GBP/USD");
  });

  it("does not replace a failed requested market with another symbol", async () => {
    const error = new MarketDataError("Requested market unavailable", { status: 429 });
    vi.mocked(InstitutionalSetupService.current).mockRejectedValue(error);
    await expect(LoadMarketIntelligence.execute("GBP/USD")).rejects.toBe(error);
    expect(LoadLiquidityIntelligence.execute).not.toHaveBeenCalled();
    expect(OpenAIProvider.generate).not.toHaveBeenCalled();
  });

  it("preserves the journal when AI generation fails", async () => {
    vi.mocked(OpenAIProvider.generate).mockRejectedValue(new Error("AI unavailable"));
    const result = await LoadMarketIntelligence.execute("GBP/USD");
    expect(result.aiBrief).toBeNull();
    expect(result.tradeJournal?.symbol).toBe("GBP/USD");
  });

  it("preserves the journal when the calendar is unavailable", async () => {
    vi.mocked(EconomicCalendarAnalysisService.risk).mockRejectedValue(new Error("Calendar unavailable"));
    vi.mocked(LoadMacroIntelligence.execute).mockRejectedValue(new Error("Calendar unavailable"));
    const result = await LoadMarketIntelligence.execute("GBP/USD");
    expect(result.tradeJournal?.symbol).toBe("GBP/USD");
    expect(result.focus).toBeNull();
    expect(result.aiBrief).toBeNull();
    expect(OpenAIProvider.generate).not.toHaveBeenCalled();
  });

  it("keeps cached journals and AI briefs while rebuilding each user's rankings", async () => {
    const first = await LoadMarketIntelligence.execute("GBP/USD", ["GBP/USD"]);
    const second = await LoadMarketIntelligence.execute("GBP/USD", ["EUR/USD"]);
    expect(second.tradeJournal).toEqual(first.tradeJournal);
    expect(second.aiBrief).toBe(first.aiBrief);
    expect(second.marketSelection?.watchedSymbols).toEqual(["EUR/USD"]);
    expect(OpenAIProvider.generate).toHaveBeenCalledTimes(1);
    expect(InstitutionalSetupService.current).toHaveBeenCalledTimes(4);
  });

  it("refreshes live analysis after one minute", async () => {
    await LoadMarketIntelligence.execute("GBP/USD");
    vi.advanceTimersByTime(60_000);
    await LoadMarketIntelligence.execute("GBP/USD");
    expect(InstitutionalSetupService.current).toHaveBeenCalledTimes(8);
  });

  it("uses saved analysis only as a closed-market study snapshot", async () => {
    const first = await LoadMarketIntelligence.execute("GBP/USD");
    vi.mocked(InstitutionalSetupService.current).mockClear();
    vi.mocked(LoadLiquidityIntelligence.execute).mockClear();
    vi.mocked(OpenAIProvider.generate).mockClear();
    vi.setSystemTime(new Date("2026-09-19T12:00:00Z"));
    const closed = await LoadMarketIntelligence.execute("GBP/USD");
    expect(closed.marketClosed).toBe(true);
    expect(closed.tradeJournal).toEqual(first.tradeJournal);
    expect(InstitutionalSetupService.current).not.toHaveBeenCalled();
    expect(LoadLiquidityIntelligence.execute).not.toHaveBeenCalled();
    expect(OpenAIProvider.generate).not.toHaveBeenCalled();
  });

  it("renders the actual journal and checklist despite missing optional data", async () => {
    vi.mocked(EconomicCalendarAnalysisService.risk).mockRejectedValue(new Error("Calendar unavailable"));
    vi.mocked(LoadMacroIntelligence.execute).mockRejectedValue(new Error("Calendar unavailable"));
    const page = await IntelligencePage({ searchParams: Promise.resolve({ symbol: ["gbp/usd", "EUR/USD"] }) });
    const html = renderToStaticMarkup(page);
    expect(html).toContain("Setup assessment");
    expect(html).toContain("BUY execution plan is ready");
    expect(html).toContain("Evidence Checklist");
    expect(html).toContain("Analysis warnings");
    expect(html).toContain("Respect structural invalidation.");
    expect(html).toContain("Temporarily unavailable:");
  });

  it("renders a provider error without launching more market requests", async () => {
    vi.mocked(InstitutionalSetupService.current).mockRejectedValue(new MarketDataError("Rate limited", { status: 429 }));
    const page = await IntelligencePage({ searchParams: Promise.resolve({ symbol: "GBP/USD" }) });
    expect(renderToStaticMarkup(page)).toContain("Live Market Data Temporarily Unavailable");
    expect(LoadLiquidityIntelligence.execute).not.toHaveBeenCalled();
  });
});
