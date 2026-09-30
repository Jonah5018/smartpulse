import { describe, expect, it } from "vitest";
import { bar, structureFixture, waveCandles } from "@/lib/testing/ohlc-fixture";
import { MarketStructureAnalyzer } from "@/lib/market-structure/market-structure-analyzer";
import {
  LiquidityEngine,
  classifyLiquidityInteraction,
} from "@/lib/institutional/liquidity/liquidity-engine";
import { DisplacementEngine } from "@/lib/institutional/displacement/displacement-engine";
import { ImbalanceAnalyzer } from "@/lib/imbalance/imbalance-analyzer";
import { PremiumDiscountEngine } from "@/lib/institutional/premium-discount/premium-discount-engine";
import { breakoutQuality } from "./breakout-quality";
import { evaluateZone, priceZones } from "./price-zones";
import { candleContext } from "./candle-context";
import type { PriceActionZone } from "./price-action-types";

describe("confirmed swing structure", () => {
  it.each([0.01, 1, 20, 600])(
    "preserves HH/HL and LH/LL across price scale %s",
    (scale) => {
      const bullish = MarketStructureAnalyzer.analyzeCandles(
        waveCandles(0.1, 100, scale),
        "15min",
      );
      const bearish = MarketStructureAnalyzer.analyzeCandles(
        waveCandles(-0.1, 100, scale),
        "15min",
      );

      expect(bullish.trend).toBe("bullish");
      expect(bullish.swingHigh?.classification).toBe("HH");
      expect(bullish.swingLow?.classification).toBe("HL");
      expect(bearish.trend).toBe("bearish");
      expect(bearish.swingHigh?.classification).toBe("LH");
      expect(bearish.swingLow?.classification).toBe("LL");
    },
  );

  it("does not force a trend from flat prices or insufficient history", () => {
    expect(
      MarketStructureAnalyzer.analyzeCandles(
        Array.from({ length: 30 }, (_, i) => bar(i)),
        "15min",
      ).trend,
    ).toBe("range");
    expect(MarketStructureAnalyzer.analyzeCandles([bar(0)], "15min").structure).toBe(
      "unknown",
    );
  });

  it("confirms BOS once and classifies an opposite break as CHOCH", () => {
    const history = waveCandles(0.1, 96);
    const before = MarketStructureAnalyzer.analyzeCandles(history, "15min");
    const high = before.swingHigh!.price;
    const low = before.swingLow!.price;
    history[history.length - 1] = bar(99, {
      open: 105,
      close: (high + low) / 2,
      high: high - 0.1,
      low: low + 0.1,
    });
    const breakout = bar(100, {
      open: high - 1,
      low: high - 1.1,
      high: high + 3,
      close: high + 2.9,
    });
    const broken = MarketStructureAnalyzer.analyzeCandles(
      [...history, breakout],
      "15min",
    );
    expect(broken.latestEvent).toBe("bos");
    expect(broken.brokenLevel).toBe(high);
    expect(
      MarketStructureAnalyzer.analyzeCandles(
        [
          ...history,
          breakout,
          bar(101, { open: high + 3, close: high + 4, high: high + 5, low: high + 2 }),
        ],
        "15min",
      ).latestEvent,
    ).toBe("none");
    expect(
      MarketStructureAnalyzer.analyzeCandles(
        [
          ...history,
          bar(100, { open: low + 1, high: low + 2, low: low - 3, close: low - 2 }),
        ],
        "15min",
      ).latestEvent,
    ).toBe("choch");
  });

  it("requires longer confirmation for external pivots", () => {
    const candles = waveCandles();
    const internal = MarketStructureAnalyzer.analyzeCandles(candles, "15min", 2);
    const external = MarketStructureAnalyzer.analyzeCandles(candles, "15min", 5);
    expect(
      internal.swings!.every((swing) => swing.confirmedIndex === swing.index + 2),
    ).toBe(true);
    expect(
      external.swings!.every((swing) => swing.confirmedIndex === swing.index + 5),
    ).toBe(true);
    expect(external.swings!.length).toBeLessThanOrEqual(internal.swings!.length);
  });
});

describe("liquidity interactions", () => {
  const pool = {
    type: "buy_side" as const,
    price: 110,
    firstIndex: 2,
    secondIndex: 2,
    touches: 1,
    confidence: 60,
  };

  it.each([
    [{ high: 109, close: 108, open: 108, low: 107 }, "untouched"],
    [{ high: 110.05, close: 109, open: 109, low: 108 }, "touch"],
    [{ high: 112, close: 109, open: 109, low: 108 }, "sweep_reversal"],
    [{ high: 112, close: 111, open: 109, low: 108 }, "close_beyond"],
    [{ high: 113, close: 109, open: 112, low: 108 }, "touch"],
  ])("distinguishes actual interaction %#", (values, expected) => {
    expect(classifyLiquidityInteraction(bar(20, values), pool, 0.1)).toBe(expected);
  });

  it("handles sell-side sweeps symmetrically", () => {
    expect(
      classifyLiquidityInteraction(
        bar(20, { open: 92, low: 88, high: 93, close: 92 }),
        { ...pool, type: "sell_side", price: 90 },
        0.1,
      ),
    ).toBe("sweep_reversal");
  });

  const swings = [
    {
      index: 2,
      confirmedIndex: 4,
      type: "high" as const,
      price: 110,
      time: bar(2).timestamp,
    },
    {
      index: 7,
      confirmedIndex: 9,
      type: "high" as const,
      price: 110,
      time: bar(7).timestamp,
    },
    {
      index: 3,
      confirmedIndex: 5,
      type: "low" as const,
      price: 90,
      time: bar(3).timestamp,
    },
    {
      index: 8,
      confirmedIndex: 10,
      type: "low" as const,
      price: 90,
      time: bar(8).timestamp,
    },
  ];

  it("groups equal levels, excludes consumed targets and rejects two-sided direction", () => {
    const history = Array.from({ length: 20 }, (_, i) => bar(i));
    const structure = structureFixture({ swings });
    const active = LiquidityEngine.analyze(history, structure);
    expect(active.equalHighs).toHaveLength(1);
    expect(active.equalLows).toHaveLength(1);
    expect(active.nearestBuySide?.price).toBe(110);
    expect(active.nearestSellSide?.price).toBe(90);
    const swept = LiquidityEngine.analyze(
      [...history, bar(20, { high: 112, low: 88 })],
      structure,
    );
    expect(swept.latestSweep).toBeNull();
    expect(swept.nearestBuySide).toBeNull();
    const consumed = LiquidityEngine.analyze(
      [...history, bar(20, { high: 112, close: 111 }), bar(21)],
      structure,
    );
    expect(consumed.nearestBuySide).toBeNull();
  });
});

describe("displacement and breakout quality", () => {
  const history = Array.from({ length: 20 }, (_, i) => bar(i));
  const strong = [...history, bar(20, { open: 100, low: 99.8, high: 112, close: 111.8 })];
  const structure = structureFixture({
    latestEvent: "bos",
    brokenLevel: 110,
    brokenAt: bar(20).timestamp,
  });

  it("requires both relative expansion and structural consequence", () => {
    expect(DisplacementEngine.analyze(strong, structure).detected).toBe(true);
    expect(DisplacementEngine.analyze(strong, structureFixture()).detected).toBe(false);
    expect(DisplacementEngine.analyze([...history, bar(20)], structure).detected).toBe(
      false,
    );
  });

  it("distinguishes confirmed and weak breakouts", () => {
    expect(
      breakoutQuality(strong, structure, DisplacementEngine.analyze(strong, structure))
        .state,
    ).toBe("confirmed");
    expect(
      breakoutQuality(
        strong,
        structure,
        DisplacementEngine.analyze(history, structureFixture()),
      ).state,
    ).toBe("unconfirmed");
  });

  it("recognizes failed breaks and a holding retest", () => {
    const displacement = DisplacementEngine.analyze([], structureFixture());
    expect(
      breakoutQuality(
        [...strong, bar(21, { open: 111, high: 112, low: 108, close: 109 })],
        structureFixture(),
        displacement,
      ).state,
    ).toBe("false_breakout");
    expect(
      breakoutQuality(
        [...strong, bar(21, { open: 111, high: 112, low: 109.9, close: 111 })],
        structureFixture(),
        displacement,
      ).state,
    ).toBe("retest");
  });

  it("observes compression, expansion and rejection without assigning a trade", () => {
    expect(
      candleContext([
        ...history,
        bar(20, { open: 100, high: 100.2, low: 99.8, close: 100.1 }),
      ]).phase,
    ).toBe("compression");
    expect(candleContext(strong).phase).toBe("expansion");
    expect(
      candleContext([
        ...history,
        bar(20, { open: 100, high: 101, low: 94, close: 100.5 }),
      ]).directionalRejection,
    ).toBe("bullish");
  });
});

describe("zones and dealing range", () => {
  const zone = (): PriceActionZone => ({
    kind: "demand",
    low: 98,
    high: 99,
    timeframe: "15min",
    formedAt: bar(0).timestamp,
    retests: 0,
    status: "fresh",
    roleReversal: false,
    evidence: [],
  });

  it("tracks freshness, separate retests, mitigation and possible role reversal", () => {
    expect(
      evaluateZone(zone(), [bar(1, { low: 100, high: 102, close: 101 })], 0).status,
    ).toBe("fresh");
    const touches = [bar(1), bar(2, { low: 100, high: 102, close: 101 }), bar(3)];
    const tested = evaluateZone(zone(), touches, 0);
    expect(tested.retests).toBe(2);
    expect(tested.evidence.join(" ")).toContain("weaken");
    const broken = evaluateZone(
      zone(),
      [...touches, bar(4, { open: 99, high: 100, low: 96, close: 97 }), bar(5)],
      0,
    );
    expect(broken.status).toBe("mitigated");
    expect(broken.roleReversal).toBe(true);
  });

  it.each(["demand", "supply"] as const)(
    "requires displacement through a prior pivot for %s",
    (kind) => {
      const candles = Array.from({ length: 20 }, (_, i) => bar(i));
      candles[10] = bar(10, { open: 100, close: 100.2, low: 95, high: 101 });
      candles[12] = bar(12, { open: 100, low: 99.9, high: 112, close: 111.9 });
      const swings = [
        {
          index: 5,
          confirmedIndex: 7,
          type: "high" as const,
          price: 108,
          time: bar(5).timestamp,
        },
        {
          index: 10,
          confirmedIndex: 12,
          type: "low" as const,
          price: 95,
          time: bar(10).timestamp,
        },
      ];
      if (kind === "supply") {
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
      const mapped =
        kind === "demand"
          ? swings
          : swings.map((swing) => ({
              ...swing,
              type: swing.type === "high" ? ("low" as const) : ("high" as const),
              price: 200 - swing.price,
            }));
      const structure = structureFixture({ swings: mapped });
      expect(
        priceZones({ candles, structure, external: structure }).some(
          (item) => item.kind === kind,
        ),
      ).toBe(true);
    },
  );

  it.each([
    [95, "discount"],
    [100, "equilibrium"],
    [105, "premium"],
  ] as const)("locates close %s", (close, zoneName) => {
    expect(
      PremiumDiscountEngine.analyze(
        [bar(0, { close, high: 110, low: 90 })],
        structureFixture(),
      ).zone,
    ).toBe(zoneName);
  });
});

describe("directional FVG mitigation", () => {
  it.each([false, true])(
    "tracks fresh, partial and full fills; bearish=%s",
    (bearish) => {
      const base = [
        bar(0, { open: 100, high: 101, low: 99, close: 100 }),
        bar(1, { open: 100, high: 110, low: 100, close: 109 }),
        bar(2, { open: 108, high: 111, low: 107, close: 110 }),
        bar(3, { open: 110, high: 112, low: 108, close: 111 }),
      ];
      const mirror = (candles: ReturnType<typeof bar>[]) =>
        bearish
          ? candles.map((item) => ({
              ...item,
              open: 220 - item.open,
              close: 220 - item.close,
              high: 220 - item.low,
              low: 220 - item.high,
            }))
          : candles;
      const get = (last: ReturnType<typeof bar>) =>
        ImbalanceAnalyzer.analyze(mirror([...base, last]), "15min").fairValueGaps.find(
          (gap) => gap.thirdCandleTimestamp === bar(2).timestamp,
        )!;
      expect(
        get(bar(4, { low: 108, high: 112, open: 110, close: 111 })).mitigationPercent,
      ).toBe(0);
      const partial = get(bar(4, { low: 104, high: 111, open: 110, close: 109 }));
      expect(partial.mitigationPercent).toBe(50);
      expect(partial.isMitigated).toBe(false);
    expect(get(bar(4, { low: 101.006, high: 111, open: 110, close: 109 })).isMitigated).toBe(false);
      expect(
        get(bar(4, { low: 100, high: 111, open: 110, close: 109 })).isMitigated,
      ).toBe(true);
    },
  );
});
