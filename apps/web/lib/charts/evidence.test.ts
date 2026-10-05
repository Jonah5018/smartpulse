import { describe, expect, it } from "vitest";
import { chartEvidence } from "./evidence";
import type { MarketCandle } from "@/lib/market";

const candles: MarketCandle[] = Array.from({ length: 60 }, (_, i) => ({
  symbol: "EUR/USD",
  interval: "15min",
  timestamp: new Date(Date.UTC(2026, 8, 1, 0, i * 15)).toISOString(),
  open: 100 + Math.sin(i) * 3,
  close: 101 + Math.sin(i) * 3,
  high: 103 + Math.sin(i) * 3,
  low: 98 + Math.sin(i) * 3,
}));
describe("causal chart replay", () => {
  it("does not change earlier evidence when future prices change", () => {
    const changed = candles.map((c, i) =>
      i < 35 ? c : { ...c, open: 500, high: 900, low: 1, close: 800 },
    );
    expect(chartEvidence(changed, 35)).toEqual(chartEvidence(candles, 35));
    expect(chartEvidence(candles, 35)).toEqual(
      chartEvidence(candles.slice(0, 35), 35),
    );
  });
  it("does not annotate insufficient history", () =>
    expect(chartEvidence(candles, 10).annotations).toEqual([]));
});
