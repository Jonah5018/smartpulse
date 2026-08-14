import type {
  MarketCandle,
} from "@/lib/market";

import type {
  ImbalanceAnalysis,
} from "./imbalance-types";

import {
  ImbalanceAnalyzer,
} from "./imbalance-analyzer";

export class ImbalanceService {
  static analyze(
    candles: MarketCandle[],
    timeframe: string
  ): ImbalanceAnalysis {
    return ImbalanceAnalyzer.analyze(
      candles,
      timeframe
    );
  }
}