import type {
  CandleInterval,
} from "@/lib/market";

import {
  MarketRepository,
} from "@/lib/repositories/market/market-repository";

import type {
  LiquidityAnalysis,
} from "./liquidity-types";

import {
  LiquidityService,
} from "./liquidity-service";

export class LiquidityEngine {
  static async current(
    symbol: string,
    timeframe: CandleInterval = "15min",
    outputsize: number = 200,
    swingStrength: number = 2
  ): Promise<LiquidityAnalysis> {
    const candles =
      await MarketRepository.getCandles(
        symbol,
        timeframe,
        outputsize
      );

    return LiquidityService.analyze(
      candles,
      timeframe,
      swingStrength
    );
  }
}