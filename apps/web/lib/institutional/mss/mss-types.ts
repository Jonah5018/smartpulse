export type MSSDirection =
  | "bullish"
  | "bearish"
  | null;

export interface MarketStructureShift {
  detected: boolean;

  direction: MSSDirection;

  price: number | null;

  candleIndex: number | null;

  confidence: number;
}