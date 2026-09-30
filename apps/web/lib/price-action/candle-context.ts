import type { MarketCandle } from "@/lib/market";
import type { CandleContext } from "./price-action-types";

export function candleContext(candles: MarketCandle[]): CandleContext {
  const latest = candles.at(-1);
  const previous = candles.at(-2);
  const patterns: string[] = [];
  const result: CandleContext = {
    patterns,
    phase: "balanced",
    directionalRejection: null,
    rangeRatio: null,
  };

  if (!latest || !previous || candles.length < 6) return result;

  const range = latest.high - latest.low;
  if (range <= 0) return result;

  const body = Math.abs(latest.close - latest.open);
  const upperWick = latest.high - Math.max(latest.open, latest.close);
  const lowerWick = Math.min(latest.open, latest.close) - latest.low;
  const baseline = candles.slice(-21, -1);
  const meanRange =
    baseline.reduce((sum, item) => sum + item.high - item.low, 0) / baseline.length;
  const ratio = meanRange > 0 ? range / meanRange : 0;
  result.rangeRatio = ratio;
  result.phase = ratio >= 1.35 ? "expansion" : ratio <= 0.65 ? "compression" : "balanced";

  if (body / range <= 0.15) patterns.push("indecision");
  if (latest.high < previous.high && latest.low > previous.low)
    patterns.push("inside_bar");
  if (latest.high > previous.high && latest.low < previous.low)
    patterns.push("outside_bar");

  if (lowerWick / range >= 0.6 && latest.close >= latest.low + range * 0.7) {
    patterns.push("bullish_rejection");
    result.directionalRejection = "bullish";
  } else if (upperWick / range >= 0.6 && latest.close <= latest.low + range * 0.3) {
    patterns.push("bearish_rejection");
    result.directionalRejection = "bearish";
  }

  const opposite = latest.close > latest.open !== previous.close > previous.open;
  const engulfs =
    Math.min(latest.open, latest.close) <= Math.min(previous.open, previous.close) &&
    Math.max(latest.open, latest.close) >= Math.max(previous.open, previous.close);

  if (opposite && engulfs && body > Math.abs(previous.close - previous.open)) {
    patterns.push(latest.close > latest.open ? "bullish_engulfing" : "bearish_engulfing");
  }

  if (ratio >= 1.35 && body / range >= 0.7) patterns.push("momentum");
  if (result.phase === "compression") patterns.push("compression");

  return result;
}
