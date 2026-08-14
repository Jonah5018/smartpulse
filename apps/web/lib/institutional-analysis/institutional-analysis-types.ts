export type MarketBias =
  | "bullish"
  | "bearish"
  | "neutral";

export type SetupGrade =
  | "A+"
  | "A"
  | "B"
  | "C"
  | "D";

export interface AnalysisEvidence {
  title: string;

  passed: boolean;

  description: string;
}

export interface InstitutionalAnalysis {
  symbol: string;

  bias: MarketBias;

  confidence: number;

  setupGrade: SetupGrade;

  recommendation: string;

  evidence: AnalysisEvidence[];
}