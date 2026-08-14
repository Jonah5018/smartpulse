export type MarketType =
  | "forex"
  | "commodity"
  | "crypto"
  | "index";

export type MarketSession =
  | "sydney"
  | "tokyo"
  | "london"
  | "new_york"
  | "overlap"
  | "closed";

export type TrendDirection =
  | "bullish"
  | "bearish"
  | "neutral";

export type VolatilityLevel =
  | "low"
  | "normal"
  | "high"
  | "extreme";

export interface MarketQuote {
  symbol: string;

  name: string;

  type: MarketType;

  bid: number;

  ask: number;

  spread: number;

  changePercent: number;

  timestamp: string;
}

import type {
  SessionStatus,
} from "@/lib/market-session";

export type MarketSessionStatus =
  SessionStatus;

export interface MarketPulse {
  score: number;

  trend: TrendDirection;

  volatility: VolatilityLevel;

  confidence: number;

  summary: string;
}