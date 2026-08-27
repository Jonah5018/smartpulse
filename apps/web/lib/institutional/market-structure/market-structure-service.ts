import type {
  MarketCandle,
} from "@/lib/market";

import {
  MarketStructureEngine,
} from "./market-structure-engine";

export class MarketStructureService {
  static analyze(
    candles: MarketCandle[]
  ) {
    return MarketStructureEngine.analyze(
      candles
    );
  }
}