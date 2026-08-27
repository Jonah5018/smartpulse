// lib/macro/macro-types.ts

export type MacroImpact = "low" | "medium" | "high";

export type MacroBias = "bullish" | "bearish" | "neutral";

export type MacroCurrency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CHF"
  | "AUD"
  | "NZD"
  | "CAD";

export interface MacroEvent {
  id: string;
  currency: MacroCurrency;
  name: string;
  impact: MacroImpact;

  previous: number | null;
  forecast: number | null;
  actual: number | null;

  timestamp: Date;
}

export interface MacroNarrative {
  headline: string;
  summary: string;
}

export interface MacroInsight {
  currency: MacroCurrency;
  event: string;

  impact: MacroImpact;
  bias: MacroBias;

  confidence: number;

  narrative: MacroNarrative;
}

export interface MacroAnalysisResult {
  insights: MacroInsight[];

  overallBias: MacroBias;

  confidence: number;

  generatedAt: Date;
}