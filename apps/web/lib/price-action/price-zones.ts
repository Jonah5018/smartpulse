import type { TimeframeAnalysisContext } from "@/lib/institutional-setup/analysis-context";
import type { MarketCandle } from "@/lib/market";
import type { PriceActionZone } from "./price-action-types";

export function evaluateZone(
  zone: PriceActionZone,
  candles: MarketCandle[],
  startIndex: number,
): PriceActionZone {
  const demand = zone.kind === "support" || zone.kind === "demand";
  let inside = false;
  let broken = false;

  for (const candle of candles.slice(startIndex)) {
    const intersects = candle.low <= zone.high && candle.high >= zone.low;

    if (intersects && !inside) zone.retests++;
    if (broken && intersects) zone.roleReversal = true;
    if (demand ? candle.close < zone.low : candle.close > zone.high) broken = true;
    inside = intersects;
  }

  zone.status = broken ? "mitigated" : zone.retests ? "tested" : "fresh";
  if (zone.retests > 1) zone.evidence.push("Repeated retests weaken the original zone.");
  if (zone.roleReversal)
    zone.evidence.push(
      "Price returned to a broken zone; role reversal remains an observation.",
    );
  return zone;
}

/** Reuse confirmed pivots; this module does not detect structure or FVGs. */
export function priceZones(context: TimeframeAnalysisContext): PriceActionZone[] {
  const { candles, structure } = context;
  const swings = structure.swings ?? [];
  const zones: PriceActionZone[] = [];

  for (const swing of swings.slice(-16)) {
    const candle = candles[swing.index];
    const baseline = candles.slice(Math.max(0, swing.index - 20), swing.index);
    const meanRange =
      baseline.reduce((sum, item) => sum + item.high - item.low, 0) /
      Math.max(1, baseline.length);
    const width = Math.max(meanRange * 0.15, (candle.high - candle.low) * 0.15);
    const demand = swing.type === "low";
    const low = demand ? candle.low : candle.high - width;
    const high = demand ? candle.low + width : candle.high;
    const base: PriceActionZone = {
      kind: demand ? "support" : "resistance",
      low,
      high,
      timeframe: structure.timeframe,
      formedAt: candles[swing.confirmedIndex].timestamp,
      retests: 0,
      status: "fresh",
      roleReversal: false,
      evidence: ["Confirmed swing reaction zone."],
    };
    zones.push(evaluateZone(base, candles, swing.confirmedIndex + 1));

    // A supply/demand zone needs a strong departure through a previously
    // confirmed opposing pivot. Large candles alone do not qualify.
    const departureIndex = candles.findIndex((item, index) => {
      if (index <= swing.index || index > swing.index + 8 || baseline.length < 5)
        return false;
      const opposite = swings
        .filter(
          (pivot) =>
            pivot.type !== swing.type &&
            pivot.confirmedIndex < index &&
            pivot.index < swing.index,
        )
        .at(-1);
      const range = item.high - item.low;
      const bodyRatio = range > 0 ? Math.abs(item.close - item.open) / range : 0;

      return (
        !!opposite &&
        range >= meanRange * 1.35 &&
        bodyRatio >= 0.7 &&
        (demand
          ? item.close > opposite.price && item.close > item.open
          : item.close < opposite.price && item.close < item.open)
      );
    });

    if (departureIndex >= 0) {
      zones.push(
        evaluateZone(
          {
            ...base,
            kind: demand ? "demand" : "supply",
            high: demand ? Math.max(candle.open, candle.close) : candle.high,
            low: demand ? candle.low : Math.min(candle.open, candle.close),
            formedAt: candles[Math.max(departureIndex, swing.confirmedIndex)].timestamp,
            retests: 0,
            roleReversal: false,
            evidence: ["Strong departure through a previously confirmed opposing swing."],
          },
          candles,
          Math.max(departureIndex, swing.confirmedIndex) + 1,
        ),
      );
    }
  }

  return zones;
}
