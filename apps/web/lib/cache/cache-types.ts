import type {
  MarketCandle,
} from "@/lib/market";

export interface CachedCandles {
  symbol: string;

  timeframe: string;

  candles: MarketCandle[];

  cachedAt: string;

  expiresAt: string;
}