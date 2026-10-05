import type { MarketCandle } from "@/lib/market";
import type { ProtectedOrder } from "./types";

/** OHLC cannot establish intrabar order; adverse stop wins if both are touched. */
export function paperExit(order: ProtectedOrder, candles: MarketCandle[]) {
  for (const candle of candles) {
    if (
      ![candle.open, candle.high, candle.low, candle.close].every(
        (n) => Number.isFinite(n) && n > 0,
      )
    )
      continue;
    const buy = order.direction === "buy";
    const stopped = buy ? candle.low <= order.stop : candle.high >= order.stop;
    const target = buy
      ? candle.high >= order.target
      : candle.low <= order.target;
    if (stopped)
      return {
        price: buy
          ? Math.min(order.stop, candle.open)
          : Math.max(order.stop, candle.open),
        reason: "stop" as const,
        time: candle.timestamp,
      };
    if (target)
      return {
        price: order.target,
        reason: "target" as const,
        time: candle.timestamp,
      };
  }
  return null;
}
