import type {
  MarketCandle,
} from "@/lib/market";

export interface CachedMarketData {
  symbol: string;

  timeframe: string;

  candles: MarketCandle[];

  updatedAt: string;

  expiresAt: string;
}