export type LiquiditySide =
  | "buy_side"
  | "sell_side";

export type LiquidityKind =
  | "swing_high"
  | "swing_low"
  | "equal_highs"
  | "equal_lows";

export interface LiquidityPool {
  symbol: string;

  side: LiquiditySide;

  kind: LiquidityKind;

  price: number;

  touches: number;

  strength: number;

  firstSeenAt: string;

  lastSeenAt: string;
}

export interface LiquiditySweep {
  symbol: string;

  side: LiquiditySide;

  price: number;

  timestamp: string;

  /**
   * Buy-side liquidity sweep:
   * price trades above the level and closes back below it.
   *
   * Sell-side liquidity sweep:
   * price trades below the level and closes back above it.
   */
  confirmation:
    | "buy_side_rejection"
    | "sell_side_rejection";
}

export interface LiquidityAnalysis {
  symbol: string;

  timeframe: string;

  candleCount: number;

  pools: LiquidityPool[];

  nearestBuySide:
    | LiquidityPool
    | null;

  nearestSellSide:
    | LiquidityPool
    | null;

  latestSweep:
    | LiquiditySweep
    | null;

  confidence: number;

  summary: string;
}