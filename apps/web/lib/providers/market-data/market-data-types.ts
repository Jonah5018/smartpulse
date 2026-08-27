export interface LiveMarketQuote {
  symbol: string;

  name: string;

  /**
   * Twelve Data's current quote endpoint
   * does not provide an executable bid/ask pair.
   *
   * These remain nullable until SmartPulse
   * integrates a genuine bid/ask source.
   */
  bid: number | null;

  ask: number | null;

  /**
   * Latest available market price.
   */
  price: number;

  changePercent: number;

  timestamp: string;
}