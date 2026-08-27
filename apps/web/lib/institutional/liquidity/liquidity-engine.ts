import type { MarketCandle } from "@/lib/market";

import type { MarketStructureAnalysis } from "@/lib/market-structure";

import type {
  LiquidityAnalysis,
  LiquidityPool,
  LiquiditySweep,
} from "./liquidity-types";

import { LiquidityUtils } from "./liquidity-utils";

export class LiquidityEngine {
  static analyze(
    candles: MarketCandle[],
    structure: MarketStructureAnalysis
  ): LiquidityAnalysis {
    const equalHighs =
      this.detectEqualHighs(candles);

    const equalLows =
      this.detectEqualLows(candles);

    const buySidePools =
      equalHighs.map((pool) => ({
        ...pool,
        type: "buy_side" as const,
      }));

    const sellSidePools =
      equalLows.map((pool) => ({
        ...pool,
        type: "sell_side" as const,
      }));

    const latestSweep =
      this.detectSweep(
        candles,
        buySidePools,
        sellSidePools
      );

    const currentPrice =
      candles.at(-1)?.close ?? 0;

    const nearestBuySide =
      this.nearestAbove(
        buySidePools,
        currentPrice
      );

    const nearestSellSide =
      this.nearestBelow(
        sellSidePools,
        currentPrice
      );

    const confidence =
      Math.min(
        100,
        45 +
          buySidePools.length * 5 +
          sellSidePools.length * 5 +
          (latestSweep?.detected
            ? 20
            : 0)
      );

    const summary =
      latestSweep?.detected
        ? `Liquidity sweep detected at ${latestSweep.price}.`
        : "No significant liquidity sweep detected.";

    return {
      symbol: "UNKNOWN",

      timeframe: structure.timeframe,

      candleCount:
        candles.length,

      buySidePools,

      sellSidePools,

      equalHighs,

      equalLows,

      latestSweep,

      nearestBuySide,

      nearestSellSide,

      confidence,

      summary,
    };
  }

  private static detectEqualHighs(
    candles: MarketCandle[]
  ): LiquidityPool[] {
    const pools: LiquidityPool[] =
      [];

    for (
      let i = 2;
      i < candles.length - 2;
      i++
    ) {
      for (
        let j = i + 1;
        j < candles.length;
        j++
      ) {
        if (
          LiquidityUtils.nearlyEqual(
            candles[i].high,
            candles[j].high
          )
        ) {
          pools.push({
            type: "equal_highs",

            price: Number(
              (
                (candles[i].high +
                  candles[j].high) /
                2
              ).toFixed(5)
            ),

            firstIndex: i,

            secondIndex: j,

            touches: 2,

            confidence: 80,
          });

          break;
        }
      }
    }

    return pools;
  }

  private static detectEqualLows(
    candles: MarketCandle[]
  ): LiquidityPool[] {
    const pools: LiquidityPool[] =
      [];

    for (
      let i = 2;
      i < candles.length - 2;
      i++
    ) {
      for (
        let j = i + 1;
        j < candles.length;
        j++
      ) {
        if (
          LiquidityUtils.nearlyEqual(
            candles[i].low,
            candles[j].low
          )
        ) {
          pools.push({
            type: "equal_lows",

            price: Number(
              (
                (candles[i].low +
                  candles[j].low) /
                2
              ).toFixed(5)
            ),

            firstIndex: i,

            secondIndex: j,

            touches: 2,

            confidence: 80,
          });

          break;
        }
      }
    }

    return pools;
  }

  private static detectSweep(
    candles: MarketCandle[],
    buySide: LiquidityPool[],
    sellSide: LiquidityPool[]
  ): LiquiditySweep | null {
    if (
      candles.length === 0
    ) {
      return null;
    }

    const last =
      candles[candles.length - 1];

    for (const pool of buySide) {
      if (
        last.high >
          pool.price &&
        last.close <
          pool.price
      ) {
        return {
          detected: true,

          side: "buy_side",

          direction: "bearish",

          price: pool.price,

          candleIndex:
            candles.length - 1,

          sweptPool: pool,
        };
      }
    }

    for (const pool of sellSide) {
      if (
        last.low <
          pool.price &&
        last.close >
          pool.price
      ) {
        return {
          detected: true,

          side: "sell_side",

          direction: "bullish",

          price: pool.price,

          candleIndex:
            candles.length - 1,

          sweptPool: pool,
        };
      }
    }

    return null;
  }

  private static nearestAbove(
    pools: LiquidityPool[],
    price: number
  ) {
    return (
      pools
        .filter(
          (pool) =>
            pool.price > price
        )
        .sort(
          (a, b) =>
            a.price - b.price
        )[0] ?? null
    );
  }

  private static nearestBelow(
    pools: LiquidityPool[],
    price: number
  ) {
    return (
      pools
        .filter(
          (pool) =>
            pool.price < price
        )
        .sort(
          (a, b) =>
            b.price - a.price
        )[0] ?? null
    );
  }
}