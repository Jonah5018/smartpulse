import { describe, expect, it } from "vitest";
import { PriceActionEngine } from "./price-action-engine";
import { ConfluenceEngine } from "@/lib/institutional/confluence/confluence-engine";
import { LiquidityEngine } from "@/lib/institutional/liquidity/liquidity-engine";
import { DisplacementEngine } from "@/lib/institutional/displacement/displacement-engine";
import { PremiumDiscountEngine } from "@/lib/institutional/premium-discount/premium-discount-engine";
import { ImbalanceAnalyzer } from "@/lib/imbalance/imbalance-analyzer";
import { bar, structureFixture } from "@/lib/testing/ohlc-fixture";
import type { MultiTimeframeAnalysis } from "@/lib/multi-timeframe";
import type { FairValueGap } from "@/lib/imbalance";

function input(direction: "bullish" | "bearish" = "bullish", reversal = false) {
  const candles = Array.from({ length: 30 }, (_, i) => bar(i));
  candles[29] = bar(29, { open: 100, low: 99.8, high: 112, close: 111.8 });
  if (direction === "bearish") {
    candles.forEach((item) => {
      const { open, close, high, low } = item;
      Object.assign(item, {
        open: 200 - open,
        close: 200 - close,
        high: 200 - low,
        low: 200 - high,
      });
    });
  }
  const structure = structureFixture({
    trend: direction,
    latestEvent: reversal ? "choch" : "bos",
    brokenAt: candles[29].timestamp,
    brokenLevel: direction === "bullish" ? 110 : 90,
  });
  const execution = { candles, structure, external: structure };
  const state = {
    timeframe: "4h" as const,
    trend: direction,
    confidence: 75,
    summary: "Established context",
  };
  const multiTimeframe: MultiTimeframeAnalysis = {
    symbol: "GBP/USD",
    h4: {
      ...state,
      bias: "continuation",
      lastBOS: null,
      lastCHOCH: null,
      liquiditySide: null,
    },
    context: state,
    structure: { ...state, timeframe: "1h" },
    execution: { ...state, timeframe: "15min" },
    directionalBias: direction,
    alignment: "aligned",
    confidence: 75,
    summary: "Aligned",
    explanation: "Aligned context",
  };
  const liquidity = LiquidityEngine.analyze(candles, structure);
  liquidity.latestSweep = {
    detected: true,
    side: direction === "bullish" ? "sell_side" : "buy_side",
    direction,
    price: direction === "bullish" ? 90 : 110,
    candleIndex: 29,
    sweptPool: null,
  };
  const gap: FairValueGap = {
    symbol: "GBP/USD",
    timeframe: "15min",
    direction,
    low: 101,
    high: 104,
    midpoint: 102.5,
    size: 3,
    timestamp: bar(28).timestamp,
    firstCandleTimestamp: bar(26).timestamp,
    thirdCandleTimestamp: bar(28).timestamp,
    isMitigated: false,
    mitigationPercent: 0,
    strength: 80,
  };
  const imbalance = {
    ...ImbalanceAnalyzer.analyze(candles, "15min"),
    fairValueGaps: [gap],
  };

  return {
    execution,
    context: { "15min": execution },
    multiTimeframe,
    liquidity,
    imbalance,
    displacement: DisplacementEngine.analyze(candles, structure),
    premiumDiscount: PremiumDiscountEngine.analyze(candles, structure),
  };
}

describe("combined price-action states", () => {
  it.each([
    ["bullish", false, "bullish_continuation"],
    ["bearish", false, "bearish_continuation"],
    ["bullish", true, "bullish_reversal"],
    ["bearish", true, "bearish_reversal"],
  ] as const)(
    "classifies %s with reversal=%s only from complete evidence",
    (direction, reversal, expected) => {
      const result = PriceActionEngine.analyze(input(direction, reversal));
      expect(result.state).toBe("confirmed_setup");
      expect(result.setupType).toBe(expected);
      expect(result.narrative).not.toMatch(/chance of winning|guaranteed|100 percent/i);
    },
  );

  it("keeps conflicting higher timeframe evidence developing", () => {
    const evidence = input();
    evidence.multiTimeframe.context.trend = "bearish";
    const result = PriceActionEngine.analyze(evidence);
    expect(result.state).toBe("developing_setup");
    expect(result.conflicts).not.toHaveLength(0);
    expect(result.beginnerNarrative).toContain("waiting");
  });

  it("does not confirm low-quality or mitigated FVGs", () => {
    const evidence = input();
    evidence.imbalance.fairValueGaps[0].strength = 20;
    expect(PriceActionEngine.analyze(evidence).state).not.toBe("confirmed_setup");
    evidence.imbalance.fairValueGaps[0].strength = 80;
    evidence.imbalance.fairValueGaps[0].isMitigated = true;
    expect(PriceActionEngine.analyze(evidence).state).not.toBe("confirmed_setup");
  });

  it("returns no trade, observation and insufficient data without forcing direction", () => {
    const evidence = input();
    evidence.multiTimeframe.directionalBias = "neutral";
    expect(PriceActionEngine.analyze(evidence).state).toBe("no_trade");

    const waiting = input();
    waiting.liquidity.latestSweep = null;
    waiting.imbalance.fairValueGaps = [];
    waiting.execution.structure.latestEvent = "none";
    waiting.execution.candles[29] = bar(29);
    expect(PriceActionEngine.analyze(waiting).state).toBe("observation");

    waiting.execution.structure.structure = "unknown";
    const insufficient = PriceActionEngine.analyze(waiting);
    expect(insufficient.state).toBe("insufficient_data");
    expect(insufficient.missing.join(" ")).toContain("swing history");
  });

  it("invalidates a breakout that closes back inside", () => {
    const evidence = input();
    evidence.execution.candles.push(
      bar(30, { open: 111, high: 112, low: 108, close: 109 }),
    );
    evidence.execution.structure.latestEvent = "none";
    expect(PriceActionEngine.analyze(evidence).state).toBe("invalid_setup");
  });
});

describe("one confluence budget", () => {
  const emptyOrderBlock = {
    detected: false,
    direction: null,
    high: null,
    low: null,
    midpoint: null,
    candleIndex: null,
    confidence: 0,
  };

  it("does not score a truthy but undetected order block", () => {
    const evidence = input();
    const result = ConfluenceEngine.evaluate(
      evidence.execution.structure,
      evidence.liquidity,
      emptyOrderBlock,
      evidence.imbalance.fairValueGaps[0],
      evidence.premiumDiscount,
      evidence.displacement,
    );
    expect(result.breakdown.orderBlock).toBe(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("rejects conflicts and does not reward opposite-direction factors", () => {
    const evidence = input();
    const result = ConfluenceEngine.evaluate(
      evidence.execution.structure,
      evidence.liquidity,
      emptyOrderBlock,
      evidence.imbalance.fairValueGaps[0],
      evidence.premiumDiscount,
      evidence.displacement,
      { direction: "sell", conflict: true, zoneUsable: false, breakoutConfirmed: true },
    );
    expect(result.valid).toBe(false);
    expect(result.breakdown.liquidity).toBe(0);
    expect(result.breakdown.fairValueGap).toBe(0);
    expect(result.breakdown.displacement).toBe(0);
  });
});
