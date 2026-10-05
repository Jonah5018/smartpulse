import type { MarketCandle } from "@/lib/market";

const INTERVAL = 15 * 60_000;

/** Validate every completed interval before advancing a persisted paper checkpoint. */
export function paperHistoryWindow(
  history: MarketCandle[],
  after: number,
  now: number,
  isClosed: (time: number) => boolean,
): MarketCandle[] {
  if (
    !Number.isFinite(after) ||
    !Number.isFinite(now) ||
    after > now ||
    now - after > 14 * 24 * 60 * 60_000
  ) {
    throw new Error("Paper history checkpoint needs attention.");
  }
  // The entry candle is excluded: its earlier extremes cannot establish a post-entry fill.
  const start = Math.ceil(after / INTERVAL) * INTERVAL;
  const end = Math.floor(now / INTERVAL) * INTERVAL;
  const indexed = new Map<number, MarketCandle>();
  for (const candle of history) {
    const time = Date.parse(candle.timestamp);
    if (!Number.isFinite(time))
      throw new Error("Invalid paper candle timestamp.");
    if (time < start || time >= end) continue;
    if (
      time % INTERVAL !== 0 ||
      indexed.has(time) ||
      ![candle.open, candle.high, candle.low, candle.close].every(
        (n) => Number.isFinite(n) && n > 0,
      ) ||
      candle.low > Math.min(candle.open, candle.close) ||
      candle.high < Math.max(candle.open, candle.close) ||
      candle.low > candle.high
    ) {
      throw new Error("Invalid or duplicate paper price history.");
    }
    indexed.set(time, candle);
  }
  const result: MarketCandle[] = [];
  for (let time = start; time < end; time += INTERVAL) {
    const candle = indexed.get(time);
    if (candle) result.push(candle);
    else if (!isClosed(time))
      throw new Error("Paper price history is incomplete.");
  }
  return result;
}
