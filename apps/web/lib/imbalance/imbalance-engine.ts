import type {
  CandleInterval,
} from "@/lib/market";

import {
  MarketRepository,
} from "@/lib/repositories/market/market-repository";

import type {
  ImbalanceAnalysis,
} from "./imbalance-types";

import {
  ImbalanceService,
} from "./imbalance-service";

export class ImbalanceEngine {
  static async current(
    symbol: string,
    timeframe: CandleInterval = "15min",
    outputsize: number = 200
  ): Promise<ImbalanceAnalysis> {
    const candles =
      await MarketRepository.getCandles(
        symbol,
        timeframe,
        outputsize
      );

    return ImbalanceService.analyze(
      candles,
      timeframe
    );
  }
}