// lib/market-regime/regime-types.ts

export type MarketRegime =
  | "trend"
  | "range"
  | "risk_off"
  | "transition";

export interface RegimeAnalysis {
  regime: MarketRegime;

  confidence: number;

  title: string;

  description: string;

  institutionalMessage: string;
}