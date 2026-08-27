import {
  LiquidityEngine,
} from "@/lib/liquidity";

import type {
  CandleInterval,
} from "@/lib/market";

export class LoadLiquidityIntelligence {
  static async execute(
    symbol: string,
    timeframe: CandleInterval = "15min"
  ) {
    return LiquidityEngine.current(
      symbol,
      timeframe,
      200,
      2
    );
  }
}