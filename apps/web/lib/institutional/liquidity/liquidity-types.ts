export type LiquidityPoolType =
  | "buy_side"
  | "sell_side"
  | "equal_highs"
  | "equal_lows";

export type LiquidityDirection =
  | "bullish"
  | "bearish";

export interface LiquidityPool {
  type: LiquidityPoolType;

  price: number;

  firstIndex: number;

  secondIndex: number;

  touches: number;

  confidence: number;
}

export interface LiquiditySweep {
  detected: boolean;

  side:
    | "buy_side"
    | "sell_side"
    | null;

  direction:
    | LiquidityDirection
    | null;

  price: number | null;

  candleIndex: number | null;

  sweptPool: LiquidityPool | null;
}

/**
 * Complete institutional liquidity analysis.
 */
export interface LiquidityAnalysis {
  symbol: string;

  timeframe: string;

  candleCount: number;

  buySidePools: LiquidityPool[];

  sellSidePools: LiquidityPool[];

  equalHighs: LiquidityPool[];

  equalLows: LiquidityPool[];

  latestSweep: LiquiditySweep | null;

  nearestBuySide:
    | LiquidityPool
    | null;

  nearestSellSide:
    | LiquidityPool
    | null;

  confidence: number;

  summary: string;
}

/**
 * Alias kept for compatibility with the
 * institutional setup layer.
 */
export type LiquidityMap =
  LiquidityAnalysis;