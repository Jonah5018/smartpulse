export type ConvictionLevel =
  | "weak"
  | "moderate"
  | "strong"
  | "exceptional";

export interface ConfluenceBreakdown {
  structure: number;

  liquidity: number;

  regime: number;

  macro: number;

  execution: number;
}

export interface ConfluenceMatrix {
  score: number;

  level: ConvictionLevel;

  breakdown: ConfluenceBreakdown;

  institutionalSummary: string;
}