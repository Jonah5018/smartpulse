import { LiquidityEngine } from "@/lib/institutional/liquidity/liquidity-engine";
import type { MarketCandle } from "@/lib/market";
import { MarketStructureAnalyzer } from "@/lib/market-structure/market-structure-analyzer";
import { ImbalanceAnalyzer } from "@/lib/imbalance/imbalance-analyzer";
import { priceZones } from "@/lib/price-action/price-zones";

export interface ChartAnnotation {
  id: string;
  label: string;
  low: number;
  high: number;
  time: string;
  kind: "structure" | "zone" | "gap" | "liquidity";
  explanation: string;
}

/** Every detector receives only the visible prefix, including pivot confirmation. */
export function chartEvidence(history: MarketCandle[], count: number) {
  const candles = history.slice(
    0,
    Math.max(0, Math.min(history.length, Math.floor(count))),
  );
  if (candles.length < 20)
    return { candles, annotations: [] as ChartAnnotation[] };
  const timeframe = candles[0].interval;
  const structure = MarketStructureAnalyzer.analyzeCandles(
    candles,
    timeframe,
    2,
  );
  const external = MarketStructureAnalyzer.analyzeCandles(
    candles,
    timeframe,
    5,
  );
  const annotations: ChartAnnotation[] = priceZones({
    candles,
    structure,
    external,
  })
    .filter((zone) => zone.status !== "mitigated")
    .slice(-6)
    .map((zone, index) => ({
      id: "zone-" + index,
      label: zone.kind,
      low: zone.low,
      high: zone.high,
      time: zone.formedAt,
      kind: "zone",
      explanation: zone.evidence.join(" ") + " Status: " + zone.status + ".",
    }));
  for (const gap of ImbalanceAnalyzer.analyze(candles, timeframe)
    .fairValueGaps.filter((gap) => !gap.isMitigated)
    .slice(-4)) {
    annotations.push({
      id: "gap-" + gap.timestamp,
      label: gap.direction + " FVG",
      low: gap.low,
      high: gap.high,
      time: gap.thirdCandleTimestamp,
      kind: "gap",
      explanation:
        "Three-candle imbalance. " +
        gap.mitigationPercent.toFixed(0) +
        "% mitigated as of this candle. A gap alone is not an entry signal.",
    });
  }
  if (structure.brokenLevel !== null && structure.brokenAt) {
    annotations.push({
      id: "structure",
      label: structure.latestEvent.toUpperCase(),
      low: structure.brokenLevel,
      high: structure.brokenLevel,
      time: structure.brokenAt,
      kind: "structure",
      explanation: structure.explanation,
    });
  }
  const liquidity = LiquidityEngine.analyze(candles, external);
  for (const pool of [liquidity.nearestBuySide, liquidity.nearestSellSide]) {
    if (pool)
      annotations.push({
        id: "liquidity-" + pool.type,
        label: pool.type.replaceAll("_", " ") + " liquidity",
        low: pool.price,
        high: pool.price,
        time:
          candles[pool.confirmedIndex ?? pool.secondIndex]?.timestamp ??
          candles[0].timestamp,
        kind: "liquidity",
        explanation:
          "A confirmed external swing liquidity reference. OHLC prices do not reveal actual resting orders. " +
          liquidity.summary,
      });
  }
  return { candles, annotations };
}
