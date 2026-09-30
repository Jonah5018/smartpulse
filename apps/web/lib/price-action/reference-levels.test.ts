import { describe, expect, it } from "vitest";
import { bar, structureFixture } from "@/lib/testing/ohlc-fixture";
import { calendarReferenceLevels, protectedSwing } from "./reference-levels";

describe("evidence-backed reference levels", () => {
  it("only reports a complete UTC day and never fills a missing hour", () => {
    const candles = Array.from({ length: 24 }, (_, index) =>
      bar(index, {
        timestamp: new Date(Date.UTC(2026, 8, 28, index)).toISOString(),
        high: 101 + index,
      }),
    );
    const structure = structureFixture();
    const context = { candles, structure, external: structure };
    expect(
      calendarReferenceLevels({ "1h": context }, new Date("2026-09-29T12:00:00Z")),
    ).toEqual([
      expect.objectContaining({
        period: "previous_day",
        high: 124,
        low: 99,
        timezone: "UTC",
      }),
    ]);
    expect(
      calendarReferenceLevels(
        { "1h": { ...context, candles: candles.slice(1) } },
        new Date("2026-09-29T12:00:00Z"),
      ),
    ).toEqual([]);
  });

  it("reports a full crypto week when the existing H4 sample covers every bar", () => {
    const candles = Array.from({ length: 42 }, (_, index) =>
      bar(index, {
        timestamp: new Date(Date.UTC(2026, 8, 21) + index * 14_400_000).toISOString(),
      }),
    );
    const structure = structureFixture();
    const levels = calendarReferenceLevels(
      { "4h": { candles, structure, external: structure } },
      new Date("2026-09-29T12:00:00Z"),
    );
    expect(levels.some((level) => level.period === "previous_week")).toBe(true);
  });

  it("requires a structural consequence before labeling a low protected", () => {
    const candles = Array.from({ length: 20 }, (_, index) => bar(index));
    const structure = structureFixture({
      swings: [
        { type: "high", price: 110, index: 3, confirmedIndex: 5, time: bar(3).timestamp },
        { type: "low", price: 90, index: 8, confirmedIndex: 10, time: bar(8).timestamp },
      ],
    });
    expect(protectedSwing(candles, structure, "low")).toBeNull();
    candles[15] = bar(15, { high: 112, close: 111 });
    expect(protectedSwing(candles, structure, "low")).toBe(90);
    candles[19] = bar(19, { low: 88, close: 89 });
    expect(protectedSwing(candles, structure, "low")).toBeNull();
  });
});
