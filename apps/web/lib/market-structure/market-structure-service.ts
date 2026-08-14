import type {
  MarketCandle,
} from "@/lib/market";

import type {
  CandleInterval,
} from "@/lib/market";

import {
  MarketRepository,
} from "@/lib/repositories/market";

import {
  MarketStructureAnalyzer,
} from "./market-structure-analyzer";

import type {
  MarketStructureAnalysis,
} from "./market-structure-types";

export class MarketStructureService {
  static async analyzeCandles(
    candles: MarketCandle[],
    timeframe: string
  ): Promise<MarketStructureAnalysis> {
    return MarketStructureAnalyzer.analyzeCandles(
      candles,
      timeframe
    );
  }

  static async current(
    symbol: string = "GBP/USD",
    interval: CandleInterval = "15min",
    outputsize: number = 200
  ): Promise<MarketStructureAnalysis> {
    const candles =
      await MarketRepository.getCandles(
        symbol,
        interval,
        outputsize
      );

    return MarketStructureAnalyzer.analyzeCandles(
      candles,
      interval,
      2
    );
  }
}