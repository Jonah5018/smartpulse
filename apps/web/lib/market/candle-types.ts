export type CandleInterval =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "1h"
  | "2h"
  | "4h"
  | "8h"
  | "1day";

export interface MarketCandle {
  symbol: string;

  interval: CandleInterval;

  timestamp: string;

  open: number;

  high: number;

  low: number;

  close: number;
}