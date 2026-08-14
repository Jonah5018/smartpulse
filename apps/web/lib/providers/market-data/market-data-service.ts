import {
  TwelveDataProvider,
} from "./twelve-data-provider";

import type {
  CandleInterval,
  MarketCandle,
} from "@/lib/market";

export class MarketDataService {
  static quotes(
    symbols: string[]
  ) {
    return TwelveDataProvider.quotes(
      symbols
    );
  }

  static candles(
    symbol: string,
    interval: CandleInterval,
    outputsize: number = 200
  ): Promise<MarketCandle[]> {
    return TwelveDataProvider.candles(
      symbol,
      interval,
      outputsize
    );
  }
}