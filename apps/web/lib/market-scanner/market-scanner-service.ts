import { scheduledScanSymbols } from "./scan-schedule";
import {
  getActiveMarketUniverse,
} from "@/lib/market/market-universe";

import {
  MarketRepository,
} from "@/lib/repositories/market";

import {
  MarketScanner,
} from "./market-scanner";

import type {
  MarketScanResult,
} from "./market-scanner-types";

export class MarketScannerService {
  static async current():
    Promise<MarketScanResult[]> {
    const scheduled = new Set(scheduledScanSymbols());
    const universe = getActiveMarketUniverse().filter(instrument => scheduled.has(instrument.symbol));

    if (
      universe.length === 0
    ) {
      return [];
    }

    const symbols =
      universe.map(
        (market) =>
          market.symbol
      );

    const quotes =
      await MarketRepository.getQuotes(
        symbols
      );

    const quoteMap =
      new Map(
        quotes.map(
          (quote) => [
            quote.symbol
              .trim()
              .toUpperCase(),

            quote.changePercent,
          ]
        )
      );

    const inputs =
      universe.filter(market => quoteMap.has(market.symbol)).map(
        (market) => ({
          symbol:
            market.symbol,

          name:
            market.name,

          type:
            market.type,

          tier:
            market.tier,

          priority:
            market.priority,

          changePercent:
            quoteMap.get(
              market.symbol
                .trim()
                .toUpperCase()
            ) ?? 0,
        })
      );

    return MarketScanner.scan(
      inputs
    );
  }
}