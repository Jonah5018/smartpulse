import { describe, expect, it } from "vitest";
import { MacroEngine } from "./macro-engine";
import { MacroContextBuilder } from "./macro-context-builder";
import { RegimeEngine } from "../market-regime/regime-engine";
import type { MacroEvent } from "./macro-types";

const event: MacroEvent = {
  id: "notice", currency: "USD", name: "Holiday", impact: "high",
  previous: null, actual: null, forecast: null, timestamp: new Date("2026-09-20"),
};

describe("macro data availability", () => {
  it("does not turn a calendar notice into a confirmed release or range regime", () => {
    const analysis = MacroEngine.analyze([event]);
    expect(analysis.confidence).toBe(0);
    expect(analysis.insights[0].narrative.headline).not.toContain("matched expectations");
    const context = MacroContextBuilder.build(analysis);
    expect(context.headline).toBe("Macro direction unavailable");
    expect(RegimeEngine.analyze(context).title).toBe("Market Regime Unavailable");
  });
  it("requires both actual and forecast figures", () => {
    expect(MacroEngine.analyze([{ ...event, actual: 3 }]).confidence).toBe(0);
  });
  it("allows matched expectations only when equal figures exist", () => {
    const analysis = MacroEngine.analyze([{ ...event, name: "Release", actual: 3, forecast: 3 }]);
    expect(analysis.insights[0].narrative.headline).toContain("matched expectations");
    expect(analysis.confidence).toBeGreaterThan(0);
  });
  it("does not infer the absence of catalysts from an empty feed", () => {
    const context = MacroContextBuilder.build(MacroEngine.analyze([]));
    expect(context.confidence).toBe(0);
    expect(context.institutionalNarrative).toContain("No economic release data");
  });
});
