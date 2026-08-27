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

/**
 * Compatibility alias used by the market provider
 * and existing market-session integration.
 */
import type {
  SessionStatus,
} from "@/lib/market-session";

export type MarketSessionStatus =
  SessionStatus;

export interface MarketPulse {
  score: number | null;

  trend: TrendDirection;

  volatility: VolatilityLevel;

  confidence: number;

  summary: string;

  /**
   * True only when the pulse represents
   * currently active market conditions.
   */
  isLive: boolean;

  /**
   * Session context used to determine whether
   * the pulse is currently valid.
   */
  session: SessionStatus;
}