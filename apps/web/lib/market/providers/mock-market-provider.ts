import type {
  MarketProvider,
} from "../market-provider";

import type {
  MarketQuote,
  MarketSessionStatus,
} from "../market-types";

import { MarketSessionService } from "@/lib/market-session";

export class MockMarketProvider
  implements MarketProvider
{
  async getQuote(
    symbol: string
  ): Promise<MarketQuote> {
    return {
      symbol,

      name: symbol,

      type: "forex",

      bid: 1.27418,

      ask: 1.27432,

      spread: 1.4,

      changePercent: 0.82,

      timestamp:
        new Date().toISOString(),
    };
  }

  async getQuotes(
    symbols: string[]
  ): Promise<MarketQuote[]> {
    return Promise.all(
      symbols.map((symbol) =>
        this.getQuote(symbol)
      )
    );
  }

  async getSessionStatus():
    Promise<MarketSessionStatus> {
    return MarketSessionService.current();
  }
}