export type DisplacementDirection =
  | "bullish"
  | "bearish";

export type FairValueGapDirection =
  | "bullish"
  | "bearish";

export interface Displacement {
  symbol: string;

  direction: DisplacementDirection;

  timestamp: string;

  candleIndex: number;

  open: number;

  high: number;

  low: number;

  close: number;

  bodySize: number;

  rangeSize: number;

  bodyToRangeRatio: number;

  relativeBodyStrength: number;

  confidence: number;
}

export interface FairValueGap {
  symbol: string;

  direction: FairValueGapDirection;

  timeframe: string;

  high: number;

  low: number;

  midpoint: number;

  size: number;

  timestamp: string;

  firstCandleTimestamp: string;

  thirdCandleTimestamp: string;

  isMitigated: boolean;

  mitigationPercent: number;

  strength: number;
}

export interface ImbalanceAnalysis {
  symbol: string;

  timeframe: string;

  candleCount: number;

  displacement:
    | Displacement
    | null;

  fairValueGaps: FairValueGap[];

  nearestBullishFVG:
    | FairValueGap
    | null;

  nearestBearishFVG:
    | FairValueGap
    | null;

  confidence: number;

  summary: string;
}