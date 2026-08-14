export type Trend =
  | "bullish"
  | "bearish"
  | "range";

export type StructureEvent =
  | "none"
  | "bos"
  | "mss"
  | "choch";

export type MarketStructureState =
  | "impulse"
  | "pullback"
  | "range"
  | "expansion"
  | "unknown";

export type SwingClassification =
  | "HH"
  | "HL"
  | "LH"
  | "LL";

export interface SwingPoint {
  price: number;
  time: string;
  type: "high" | "low";
  classification?: SwingClassification;
}

export interface MarketStructureAnalysis {
  trend: Trend;

  structure: MarketStructureState;

  latestEvent: StructureEvent;

  higherTimeframeBias: Trend;

  confidence: number;

  swingHigh: SwingPoint | null;

  swingLow: SwingPoint | null;

  /**
   * Price level that was broken by the latest
   * confirmed structural event.
   */
  brokenLevel: number | null;

  /**
   * Timestamp of the candle that confirmed
   * the structural break.
   */
  brokenAt: string | null;

  /**
   * Timeframe used for this analysis.
   */
  timeframe: string;

  /**
   * Number of candles used.
   */
  candleCount: number;

  /**
   * Concise explanation for dashboard use.
   */
  summary: string;

  /**
   * Detailed evidence for SmartPulse's
   * mentor/analyst layer.
   */
  explanation: string;
}