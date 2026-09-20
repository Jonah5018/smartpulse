import { describe, expect, it } from "vitest";
import { ExplainabilityEngine } from "./explainability-engine";
import { createSetup } from "@/lib/testing/institutional-setup-fixture";
import type { MarketStructureAnalysis } from "@/lib/market-structure";

describe("ExplainabilityEngine", () => {
  it.each(["bos", "mss", "choch"] as const)("preserves %s evidence from execution structure", (latestEvent) => {
    const setup = createSetup();
    const structure: MarketStructureAnalysis = {
      trend: "bullish", structure: "expansion", latestEvent, higherTimeframeBias: "bearish",
      confidence: 80, swingHigh: null, swingLow: null, brokenLevel: 1.27,
      brokenAt: "2026-09-16T12:00:00Z", timeframe: "15min", candleCount: 200,
      summary: "Structure confirmed", explanation: "Structure confirmed",
    };
    const result = ExplainabilityEngine.generate(
      setup.confluence, structure, setup.liquidity, null, setup.fairValueGap, setup.displacement
    );
    expect(result.confirmations).toContain(`${latestEvent.toUpperCase()} confirms a structural transition on 15min.`);
    expect(result.narrative).toContain("15min execution structure remains bullish");
    expect(result.narrative).not.toContain("Higher-timeframe structure");
  });
});
