import type {
  CandleInterval,
} from "@/lib/market";

export type TradingStyle =
  | "scalping"
  | "intraday"
  | "swing";

export interface TimeframeConfiguration {
  context: CandleInterval;

  structure: CandleInterval;

  execution: CandleInterval;
}

export interface TraderAnalysisProfile {
  tradingStyle: TradingStyle;

  timeframes: TimeframeConfiguration;
}

export interface TimeframeMarketState {
  timeframe: CandleInterval;

  trend:
    | "bullish"
    | "bearish"
    | "range";

  structure:
    | "impulse"
    | "pullback"
    | "range"
    | "expansion"
    | "unknown";

  structureEvent:
    | "none"
    | "bos"
    | "mss"
    | "choch";

  confidence: number;

  summary: string;
}

export interface MultiTimeframeAnalysis {
  symbol: string;

  profile: TraderAnalysisProfile;

  context: TimeframeMarketState;

  structure: TimeframeMarketState;

  execution: TimeframeMarketState;

  directionalBias:
    | "bullish"
    | "bearish"
    | "neutral";

  alignment:
    | "aligned"
    | "partially_aligned"
    | "countertrend"
    | "range_context";

  confidence: number;

  summary: string;

  explanation: string;
}