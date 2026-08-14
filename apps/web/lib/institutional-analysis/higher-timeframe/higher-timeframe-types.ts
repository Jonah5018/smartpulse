export type HigherTimeframeBias =
  | "bullish"
  | "bearish"
  | "range";

export interface HigherTimeframeAnalysis {
  bias: HigherTimeframeBias;

  confidence: number;

  narrative: string;
}