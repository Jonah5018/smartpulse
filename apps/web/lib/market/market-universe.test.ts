import { describe, expect, it } from "vitest";
import { normalizeMarketSymbol, normalizeMarketSymbols } from "./market-universe";

describe("legacy market preferences", () => {
  it("matches onboarding identifiers to the analysis symbols", () => {
    expect(normalizeMarketSymbol(" gbpusd ")).toBe("GBP/USD");
    expect(normalizeMarketSymbol("XAUUSD")).toBe("XAU/USD");
  });
  it("deduplicates equivalent favorites while retaining unsupported preferences", () => {
    expect(normalizeMarketSymbols(["GBPUSD", "GBP/USD", "US30", ""])).toEqual(["GBP/USD", "US30"]);
  });
});
