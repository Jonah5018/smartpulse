import type {
  MarketCandle,
} from "@/lib/market";

import type {
  LiquidityAnalysis,
} from "./liquidity-types";

import {
  LiquidityAnalyzer,
} from "./liquidity-analyzer";

export class LiquidityService {
  static analyze(
    candles: MarketCandle[],
    timeframe: string,
    swingStrength: number = 2
  ): LiquidityAnalysis {
    return LiquidityAnalyzer.analyze(
      candles,
      timeframe,
      swingStrength
    );
  }
}