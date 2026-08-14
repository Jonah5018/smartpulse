import type {
  MarketQuote,
  MarketSessionStatus,
} from "./market-types";

export interface MarketProvider {
  /**
   * Current quote.
   */
  getQuote(
    symbol: string
  ): Promise<MarketQuote>;

  /**
   * Multiple quotes.
   */
  getQuotes(
    symbols: string[]
  ): Promise<MarketQuote[]>;

  /**
   * Current market session.
   */
  getSessionStatus():
    Promise<MarketSessionStatus>;
}