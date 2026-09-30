import type { MarketCandle } from "@/lib/market";
import type { MarketStructureAnalysis } from "@/lib/market-structure";
import type { Displacement } from "@/lib/institutional/displacement";
import type { BreakoutAssessment } from "./price-action-types";

export function breakoutQuality(
  candles: MarketCandle[],
  structure: MarketStructureAnalysis,
  displacement: Displacement,
): BreakoutAssessment {
  const latest = candles.at(-1);
  const previous = candles.at(-2);
  const empty: BreakoutAssessment = {
    state: "none",
    direction: null,
    level: null,
    explanation: "No confirmed breakout; wait for a meaningful level to be crossed.",
  };

  if (!latest || !previous) return empty;

  if (structure.latestEvent !== "none" && structure.brokenLevel !== null) {
    return {
      state: displacement.detected ? "confirmed" : "unconfirmed",
      direction: latest.close > structure.brokenLevel ? "bullish" : "bearish",
      level: structure.brokenLevel,
      explanation: displacement.detected
        ? "A close through confirmed structure has relative range expansion and a strong close."
        : "Price closed beyond structure, but displacement confirmation is incomplete.",
    };
  }

  for (const swing of [structure.swingHigh, structure.swingLow]) {
    if (!swing) continue;
    const bullish = swing.type === "high";
    const previousBeyond = bullish
      ? previous.close > swing.price
      : previous.close < swing.price;
    const nowInside = bullish ? latest.close < swing.price : latest.close > swing.price;
    const touched = latest.low <= swing.price && latest.high >= swing.price;

    if (previousBeyond && nowInside) {
      return {
        state: "false_breakout",
        direction: bullish ? "bullish" : "bearish",
        level: swing.price,
        explanation:
          "The previous close beyond the level failed to hold; price returned inside.",
      };
    }

    if (previousBeyond && touched && !nowInside) {
      return {
        state: "retest",
        direction: bullish ? "bullish" : "bearish",
        level: swing.price,
        explanation:
          "Price retested a crossed level and closed on the breakout side; further follow-through is still needed.",
      };
    }

    if (!previousBeyond && touched) {
      return {
        state: "potential",
        direction: bullish ? "bullish" : "bearish",
        level: swing.price,
        explanation:
          "Price interacted with a structural boundary without a confirmed breakout.",
      };
    }
  }

  return empty;
}
