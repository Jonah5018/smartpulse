import { describe, expect, it } from "vitest";
import { MARKET_UNIVERSE, canonicalInstrumentId, findInstrument, getActiveMarketUniverse, getProviderSymbol, requireInstrument } from "./market-universe";
import { canAccessMarket, marketsForPlan } from "@/lib/billing/market-access";
import { scheduledScanSymbols } from "@/lib/market-scanner/scan-schedule";

describe("canonical market universe", () => {
  it.each([
    ["gbpusd", "GBPUSD", "forex", "GBP/USD"],
    ["EUR/JPY", "EURJPY", "forex", "EUR/JPY"],
    ["XAUUSD", "XAUUSD", "metal", "XAU/USD"],
    ["xag/usd", "XAGUSD", "metal", "XAG/USD"],
    ["BTCUSD", "BTCUSD", "crypto", "BTC/USD"],
    ["ETH/USD", "ETHUSD", "crypto", "ETH/USD"],
  ])("resolves %s through one registry", (alias, id, assetClass, providerSymbol) => {
    expect(canonicalInstrumentId(alias)).toBe(id);
    expect(requireInstrument(alias)).toMatchObject({ assetClass, symbol: providerSymbol });
    expect(getProviderSymbol(alias, "twelveData")).toBe(providerSymbol);
  });

  it.each([["USTEC", "NAS100"], ["US500", "SP500"], ["DJI", "US30"]])(
    "keeps unverified index %s explicitly unavailable", (alias, id) => {
      expect(requireInstrument(alias)).toMatchObject({ id, enabled: false, assetClass: "index" });
      expect(getProviderSymbol(alias, "twelveData")).toBeNull();
      expect(canAccessMarket("elite", alias)).toBe(false);
    }
  );

  it("rejects unknown identities and has no duplicate canonical IDs", () => {
    expect(findInstrument("NOTREAL")).toBeUndefined();
    expect(() => canonicalInstrumentId("NOTREAL")).toThrow("Unsupported");
    expect(new Set(MARKET_UNIVERSE.map(item => item.id)).size).toBe(18);
    expect(getActiveMarketUniverse()).toHaveLength(15);
  });

  it("uses effective plan eligibility independently from analysis", () => {
    expect(marketsForPlan("basic")).toHaveLength(7);
    expect(marketsForPlan("pro")).toHaveLength(15);
    expect(marketsForPlan("none")).toHaveLength(0);
    expect(canAccessMarket("basic", "GBPJPY")).toBe(false);
    expect(canAccessMarket("pro", "XAGUSD")).toBe(true);
  });

  it("bounds scans and keeps crypto active on weekends", () => {
    const weekday = new Date("2026-09-28T12:00:00Z");
    expect(scheduledScanSymbols(weekday)).toHaveLength(4);
    expect(scheduledScanSymbols(weekday)).toEqual(scheduledScanSymbols(weekday));
    expect(scheduledScanSymbols(new Date("2026-09-27T12:00:00Z")).sort())
      .toEqual(["BTC/USD", "ETH/USD"]);
  });
});
