import {
  getActiveMarketUniverse,
} from "@/lib/market/market-universe";

import {
  MarketRepository,
} from "@/lib/repositories/market";

import {
  MarketSessionService,
} from "@/lib/market-session";

import {
  MarketScanner,
} from "./market-scanner";

import type {
  MarketScanResult,
} from "./market-scanner-types";

export class MarketScannerService {
  static async current():
    Promise<MarketScanResult[]> {
    const session =
      MarketSessionService.current();

    /*
     * Do not scan or request live quotes when
     * the market is closed.
     */
    if (!session.isOpen) {
      return [];
    }

    const universe =
      getActiveMarketUniverse();

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
      universe.map(
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