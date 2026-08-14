import type {
  CandleInterval,
} from "@/lib/market";

import type {
  MarketStructureAnalysis,
} from "./market-structure-types";

import {
  MarketRepository,
} from "../repositories/market/market-repository";

import {
  MarketStructureAnalyzer,
} from "./market-structure-analyzer";

export class MarketStructureEngine {
  /**
   * Run real market-structure analysis from
   * live market candles.
   *
   * This is the application-facing entry point
   * for the market-structure subsystem.
   */
  static async current(
    symbol: string,
    timeframe: CandleInterval = "15min",
    outputsize: number = 200,
    swingStrength: number = 2
  ): Promise<MarketStructureAnalysis> {
    const candles =
      await MarketRepository.getCandles(
        symbol,
        timeframe,
        outputsize
      );

    return MarketStructureAnalyzer.analyzeCandles(
      candles,
      timeframe,
      swingStrength
    );
  }
}