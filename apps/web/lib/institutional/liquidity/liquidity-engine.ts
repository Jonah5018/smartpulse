import type { MarketCandle } from "@/lib/market";
import type { MarketStructureAnalysis } from "@/lib/market-structure";
import type { LiquidityAnalysis, LiquidityPool, LiquiditySweep } from "./liquidity-types";

export type LiquidityInteraction =
  "untouched" | "touch" | "sweep_reversal" | "close_beyond";

export function classifyLiquidityInteraction(
  candle: MarketCandle,
  pool: LiquidityPool,
  tolerance: number,
): LiquidityInteraction {
  const buySide = pool.type === "buy_side" || pool.type === "equal_highs";
  const extreme = buySide ? candle.high : candle.low;
  const beyond = buySide
    ? extreme > pool.price + tolerance
    : extreme < pool.price - tolerance;
  const closeBeyond = buySide
    ? candle.close > pool.price + tolerance
    : candle.close < pool.price - tolerance;
  const recovered = buySide ? candle.close < pool.price : candle.close > pool.price;
  const startedInside = buySide
    ? candle.open <= pool.price + tolerance
    : candle.open >= pool.price - tolerance;

  if (closeBeyond) return "close_beyond";
  if (beyond && recovered && startedInside) return "sweep_reversal";
  if (Math.abs(extreme - pool.price) <= tolerance || beyond) return "touch";
  return "untouched";
}

export class LiquidityEngine {
  static analyze(
    candles: MarketCandle[],
    structure: MarketStructureAnalysis,
  ): LiquidityAnalysis {
    const history = candles.slice(0, -1);
    const tolerance =
      (history.slice(-20).reduce((sum, candle) => sum + candle.high - candle.low, 0) /
        Math.max(1, Math.min(20, history.length))) *
      0.1;
    const swings = (structure.swings ?? []).filter(
      (swing) => swing.confirmedIndex < candles.length - 1,
    );
    const pools: LiquidityPool[] = [];

    // Only confirmed pivots may establish a pool. The current candle cannot
    // create the level that it is then said to have swept.
    for (const swing of swings) {
      const side = swing.type === "high" ? "buy_side" : "sell_side";
      const existing = pools.find(
        (pool) => pool.type === side && Math.abs(pool.price - swing.price) <= tolerance,
      );

      if (existing) {
        existing.secondIndex = swing.index;
        existing.touches++;
      } else {
        pools.push({
          type: side,
          price: swing.price,
          firstIndex: swing.index,
          secondIndex: swing.index,
          confirmedIndex: swing.confirmedIndex,
          touches: 1,
          confidence: 60,
        });
      }
    }

    const active = pools.filter(
      (pool) =>
        !history.slice((pool.confirmedIndex ?? pool.secondIndex) + 1).some((candle) => {
          const interaction = classifyLiquidityInteraction(candle, pool, tolerance);
          return interaction === "close_beyond" || interaction === "sweep_reversal";
        }),
    );
    const latest = candles.at(-1);
    const interactions = latest
      ? active.map((pool) => ({
          pool,
          kind: classifyLiquidityInteraction(latest, pool, tolerance),
        }))
      : [];
    const swept = interactions.filter((item) => item.kind === "sweep_reversal");
    const sides = new Set(swept.map((item) => item.pool.type));
    // A two-sided outside bar is ambiguous; do not choose a direction by order.
    const pool = sides.size === 1 ? swept[0]?.pool : undefined;
    const latestSweep: LiquiditySweep | null = pool
      ? {
          detected: true,
          side: pool.type === "buy_side" ? "buy_side" : "sell_side",
          direction: pool.type === "buy_side" ? "bearish" : "bullish",
          price: pool.price,
          candleIndex: candles.length - 1,
          sweptPool: pool,
        }
      : null;
    const remaining = interactions
      .filter((item) => item.kind === "untouched" || item.kind === "touch")
      .map((item) => item.pool);
    const buySidePools = remaining.filter((item) => item.type === "buy_side");
    const sellSidePools = remaining.filter((item) => item.type === "sell_side");

    return {
      symbol: latest?.symbol ?? "UNKNOWN",
      timeframe: structure.timeframe,
      candleCount: candles.length,
      buySidePools,
      sellSidePools,
      equalHighs: active.filter((item) => item.type === "buy_side" && item.touches >= 2),
      equalLows: active.filter((item) => item.type === "sell_side" && item.touches >= 2),
      latestSweep,
      nearestBuySide:
        buySidePools
          .filter((item) => item.price > (latest?.close ?? Infinity))
          .sort((a, b) => a.price - b.price)[0] ?? null,
      nearestSellSide:
        sellSidePools
          .filter((item) => item.price < (latest?.close ?? -Infinity))
          .sort((a, b) => b.price - a.price)[0] ?? null,
      confidence:
        active.length === 0
          ? 0
          : Math.min(100, 45 + active.length * 5 + (latestSweep ? 20 : 0)),
      summary: latestSweep
        ? "Price exceeded a previously confirmed liquidity level and closed back inside."
        : sides.size > 1
          ? "Both sides were swept; directional evidence is conflicting."
          : "No confirmed liquidity sweep on the latest candle.",
      interactions: interactions.map((item) => ({
        side: item.pool.type,
        price: item.pool.price,
        kind: item.kind,
      })),
    };
  }
}
