export interface LiveMarketQuote {
  symbol: string;

  name: string;

  bid: number;

  ask: number;

  price: number;

  changePercent: number;

  timestamp: string;
}