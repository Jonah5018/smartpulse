import type {
  MarketCandle,
} from "@/lib/market";

import type {
  LiquidityAnalysis,
  LiquidityKind,
  LiquidityPool,
  LiquiditySide,
  LiquiditySweep,
} from "./liquidity-types";

interface LiquidityCandidate {
  price: number;

  timestamp: string;

  index: number;

  side: LiquiditySide;

  kind: LiquidityKind;
}

export class LiquidityAnalyzer {
  static analyze(
    candles: MarketCandle[],
    timeframe: string,
    swingStrength: number = 2
  ): LiquidityAnalysis {
    const ordered = [...candles].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );

    if (
      ordered.length <
      swingStrength * 2 + 3
    ) {
      return {
        symbol:
          ordered[0]?.symbol ?? "UNKNOWN",

        timeframe,

        candleCount:
          ordered.length,

        pools: [],

        nearestBuySide: null,

        nearestSellSide: null,

        highestPriority: null,

        latestSweep: null,

        confidence: 0,

        summary:
          "Not enough candle history to establish reliable liquidity levels.",
      };
    }

    const candidates =
      this.detectCandidates(
        ordered,
        swingStrength
      );

    const pools =
      this.buildPools(
        candidates,
        ordered
      );

    const currentPrice =
      ordered[ordered.length - 1].close;

    const nearestBuySide =
      this.findNearestPool(
        pools,
        "buy_side",
        currentPrice
      );

    const nearestSellSide =
      this.findNearestPool(
        pools,
        "sell_side",
        currentPrice
      );

    const latestSweep =
      this.detectLatestSweep(
        ordered,
        pools
      );

    const confidence =
      this.calculateConfidence(
        ordered.length,
        pools,
        latestSweep
      );

    const summary =
      this.buildSummary(
        currentPrice,
        nearestBuySide,
        nearestSellSide,
        latestSweep
      );

    return {
      symbol:
        ordered[ordered.length - 1].symbol,

      timeframe,

      candleCount:
        ordered.length,

      pools,

      nearestBuySide,

      nearestSellSide,

      highestPriority:
        pools[0] ?? null,

      latestSweep,

      confidence,

      summary,
    };
  }

  private static detectCandidates(
    candles: MarketCandle[],
    strength: number
  ): LiquidityCandidate[] {
    const candidates:
      LiquidityCandidate[] = [];

    for (
      let i = strength;
      i < candles.length - strength;
      i++
    ) {
      const candle =
        candles[i];

      let isSwingHigh = true;
      let isSwingLow = true;

      for (
        let offset = 1;
        offset <= strength;
        offset++
      ) {
        const left =
          candles[i - offset];

        const right =
          candles[i + offset];

        if (
          candle.high <= left.high ||
          candle.high <= right.high
        ) {
          isSwingHigh = false;
        }

        if (
          candle.low >= left.low ||
          candle.low >= right.low
        ) {
          isSwingLow = false;
        }
      }

      if (isSwingHigh) {
        candidates.push({
          price: candle.high,
          timestamp:
            candle.timestamp,
          index: i,
          side: "buy_side",
          kind: "swing_high",
        });
      }

      if (isSwingLow) {
        candidates.push({
          price: candle.low,
          timestamp:
            candle.timestamp,
          index: i,
          side: "sell_side",
          kind: "swing_low",
        });
      }
    }

    return candidates;
  }

  private static buildPools(
    candidates: LiquidityCandidate[],
    candles: MarketCandle[]
  ): LiquidityPool[] {
    const pools: Omit<
      LiquidityPool,
      "distance" | "targetScore" | "heat"
    >[] = [];

    const groupedBySide: Record<
      LiquiditySide,
      LiquidityCandidate[]
    > = {
      buy_side: candidates.filter(
        (candidate) =>
          candidate.side === "buy_side"
      ),

      sell_side: candidates.filter(
        (candidate) =>
          candidate.side === "sell_side"
      ),
    };

    for (
      const side of [
        "buy_side",
        "sell_side",
      ] as LiquiditySide[]
    ) {
      const sideCandidates =
        groupedBySide[side].sort(
          (a, b) =>
            a.price - b.price
        );

      const used =
        new Set<number>();

      for (
        let i = 0;
        i < sideCandidates.length;
        i++
      ) {
        if (used.has(i)) {
          continue;
        }

        const base =
          sideCandidates[i];

        const tolerance =
          this.priceTolerance(
            base.price
          );

        const cluster =
          sideCandidates.filter(
            (candidate, index) => {
              if (
                used.has(index)
              ) {
                return false;
              }

              return (
                Math.abs(
                  candidate.price -
                    base.price
                ) <= tolerance
              );
            }
          );

        const indices =
          cluster.map(
            (candidate) =>
              sideCandidates.indexOf(
                candidate
              )
          );

        indices.forEach((index) =>
          used.add(index)
        );

        const averagePrice =
          cluster.reduce(
            (sum, candidate) =>
              sum +
              candidate.price,
            0
          ) / cluster.length;

        const first =
          cluster.reduce(
            (earliest, candidate) =>
              new Date(
                candidate.timestamp
              ).getTime() <
              new Date(
                earliest.timestamp
              ).getTime()
                ? candidate
                : earliest
          );

        const last =
          cluster.reduce(
            (latest, candidate) =>
              new Date(
                candidate.timestamp
              ).getTime() >
              new Date(
                latest.timestamp
              ).getTime()
                ? candidate
                : latest
          );

        const kind =
          cluster.length >= 2
            ? side === "buy_side"
              ? "equal_highs"
              : "equal_lows"
            : base.kind;

        const recencyScore =
          this.calculateRecencyScore(
            last.timestamp,
            candles[
              candles.length - 1
            ].timestamp
          );

        const strength =
          Math.min(
            100,
            45 +
              (cluster.length - 1) *
                15 +
              recencyScore
          );

        pools.push({
          symbol:
            candles[
              candles.length - 1
            ].symbol,

          side,

          kind,

          price:
            Number(
              averagePrice.toFixed(6)
            ),

          touches:
            cluster.length,

          strength,

          firstSeenAt:
            first.timestamp,

          lastSeenAt:
            last.timestamp,
        });
      }
    }

         const currentPrice =
           candles[candles.length - 1].close;

          const enriched =
            pools.map((pool) => {
             const distance =
               Math.abs(pool.price - currentPrice);

              const targetScore =
                Math.round(
                  pool.strength -
                  distance * 10000
           );

              return {
                ...pool,

                distance,

                targetScore,

                heat:
                  (targetScore >= 80
                    ? "hot"
                    : targetScore >= 60
                    ? "warm"
                    : "cold") as LiquidityPool["heat"],
         };
      });

    return enriched.sort(
      (a, b) =>
        b.targetScore -
        a.targetScore
   );
  }

  private static findNearestPool(
    pools: LiquidityPool[],
    side: LiquiditySide,
    currentPrice: number
  ): LiquidityPool | null {
    const candidates =
      pools.filter((pool) => {
        if (pool.side !== side) {
          return false;
        }

        if (side === "buy_side") {
          return pool.price > currentPrice;
        }

        return pool.price < currentPrice;
      });

    if (
      candidates.length === 0
    ) {
      return null;
    }

    return candidates.reduce(
      (nearest, current) => {
        const nearestDistance =
          Math.abs(
            nearest.price -
              currentPrice
          );

        const currentDistance =
          Math.abs(
            current.price -
              currentPrice
          );

        return currentDistance <
          nearestDistance
          ? current
          : nearest;
      }
    );
  }

  private static detectLatestSweep(
    candles: MarketCandle[],
    pools: LiquidityPool[]
  ): LiquiditySweep | null {
    const recentCandles =
      candles.slice(-20);

    const sweeps:
      LiquiditySweep[] = [];

    for (
      const candle of recentCandles
    ) {
      for (
        const pool of pools
      ) {
        /*
         * Do not use a liquidity pool that
         * was formed after the candle being
         * evaluated.
         */
        if (
          new Date(
            pool.lastSeenAt
          ).getTime() >=
          new Date(
            candle.timestamp
          ).getTime()
        ) {
          continue;
        }

        const tolerance =
          this.priceTolerance(
            pool.price
          );

        if (
          pool.side ===
            "buy_side" &&
          candle.high >
            pool.price +
              tolerance &&
          candle.close <
            pool.price
        ) {
          sweeps.push({
            symbol:
              candle.symbol,

            side: "buy_side",

            price:
              pool.price,

            timestamp:
              candle.timestamp,

            confirmation:
              "buy_side_rejection",
          });
        }

        if (
          pool.side ===
            "sell_side" &&
          candle.low <
            pool.price -
              tolerance &&
          candle.close >
            pool.price
        ) {
          sweeps.push({
            symbol:
              candle.symbol,

            side: "sell_side",

            price:
              pool.price,

            timestamp:
              candle.timestamp,

            confirmation:
              "sell_side_rejection",
          });
        }
      }
    }

    if (
      sweeps.length === 0
    ) {
      return null;
    }

    return sweeps.reduce(
      (latest, current) =>
        new Date(
          current.timestamp
        ).getTime() >
        new Date(
          latest.timestamp
        ).getTime()
          ? current
          : latest
    );
  }

  private static calculateConfidence(
    candleCount: number,
    pools: LiquidityPool[],
    latestSweep:
      LiquiditySweep | null
  ): number {
    let score = 40;

    if (candleCount >= 50) {
      score += 15;
    } else if (
      candleCount >= 25
    ) {
      score += 8;
    }

    if (pools.length >= 4) {
      score += 15;
    } else if (
      pools.length >= 2
    ) {
      score += 8;
    }

    if (latestSweep) {
      score += 20;
    }

    const strongPools =
      pools.filter(
        (pool) =>
          pool.strength >= 70
      );

    if (
      strongPools.length >= 2
    ) {
      score += 10;
    }

    return Math.min(
      100,
      score
    );
  }

  private static calculateRecencyScore(
    timestamp: string,
    latestTimestamp: string
  ): number {
    const difference =
      Math.abs(
        new Date(
          latestTimestamp
        ).getTime() -
          new Date(
            timestamp
          ).getTime()
      );

    const hours =
      difference /
      (1000 * 60 * 60);

    if (hours <= 4) {
      return 20;
    }

    if (hours <= 12) {
      return 15;
    }

    if (hours <= 24) {
      return 10;
    }

    if (hours <= 72) {
      return 5;
    }

    return 0;
  }

  private static priceTolerance(
    price: number
  ): number {
    /*
     * Approximately 0.02% of price.
     *
     * This allows near-equal highs/lows
     * to form a liquidity cluster without
     * treating materially different levels
     * as equal.
     */
    return Math.max(
      0.00001,
      Math.abs(price) * 0.0002
    );
  }

  private static buildSummary(
    currentPrice: number,
    nearestBuySide:
      LiquidityPool | null,
    nearestSellSide:
      LiquidityPool | null,
    latestSweep:
      LiquiditySweep | null
  ): string {
    const parts: string[] = [];
    const priority =
      nearestBuySide?.targetScore ??
      nearestSellSide?.targetScore;

    if (nearestBuySide) {
      parts.push(
        `Nearest buy-side liquidity is around ${nearestBuySide.price}.`
      );
    }

    if (nearestSellSide) {
      parts.push(
        `Nearest sell-side liquidity is around ${nearestSellSide.price}.`
      );
    }

    if (latestSweep) {
      if (
        latestSweep.side ===
        "buy_side"
      ) {
        parts.push(
          `Buy-side liquidity was swept around ${latestSweep.price} and price closed back below the level.`
        );
      } else {
        parts.push(
          `Sell-side liquidity was swept around ${latestSweep.price} and price closed back above the level.`
        );
      }
    }

    if (
      parts.length === 0
    ) {
      return `Current price is ${currentPrice}. No clear nearby liquidity pool has been identified.`;
    }

    return parts.join(" ");
  }
}