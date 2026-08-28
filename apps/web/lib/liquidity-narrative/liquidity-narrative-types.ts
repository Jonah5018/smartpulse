export type LiquidityNarrative =
  | "buy_side_swept"
  | "sell_side_swept"
  | "expansion"
  | "accumulation"
  | "distribution";

export interface LiquidityNarrativeAnalysis {
  symbol: string;

  timeframe: "15min";

  narrative: LiquidityNarrative;

  confidence: number;

  bullishContinuation: boolean;

  bearishContinuation: boolean;

  summary: string;
}