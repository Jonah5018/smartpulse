export type Timeframe =
  | "5min"
  | "15min"
  | "1h"
  | "4h";

export type Trend =
  | "bullish"
  | "bearish"
  | "range";

export type DirectionalBias =
  | "bullish"
  | "bearish"
  | "neutral";

export type Alignment =
  | "strong"
  | "moderate"
  | "weak"
  | "mixed";

export type InstitutionalBias =
  | "continuation"
  | "retracement"
  | "reversal"
  | "neutral";

export interface TimeframeMarketState {
  timeframe: Timeframe;

  trend: Trend;

  confidence: number;

  summary: string;
}

export interface H4InstitutionalState
  extends TimeframeMarketState {
  bias: InstitutionalBias;

  lastBOS: number | null;

  lastCHOCH: number | null;

  liquiditySide:
    | "buy_side"
    | "sell_side"
    | null;
}

export interface MultiTimeframeAnalysis {
  symbol: string;

  h4: H4InstitutionalState;

  context: TimeframeMarketState;

  structure: TimeframeMarketState;

  execution: TimeframeMarketState;

  directionalBias: DirectionalBias;

  alignment: Alignment;

  confidence: number;

  summary: string;

  explanation: string;
}

export interface TraderAnalysisProfile {
  timeframes: {
    context: Timeframe;
    structure: Timeframe;
    execution: Timeframe;
  };
}

export const SCALPER_PROFILE: TraderAnalysisProfile =
  {
    timeframes: {
      context: "1h",
      structure: "15min",
      execution: "5min",
    },
  };

export const INTRADAY_PROFILE: TraderAnalysisProfile =
  {
    timeframes: {
      context: "4h",
      structure: "1h",
      execution: "15min",
    },
  };

export const SWING_PROFILE: TraderAnalysisProfile =
  {
    timeframes: {
      context: "4h",
      structure: "1h",
      execution: "15min",
    },
  };