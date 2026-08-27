export type TrendDirection =
  | "bullish"
  | "bearish"
  | "range";

export type SwingType =
  | "high"
  | "low";

export interface SwingPoint {
  index: number;

  price: number;

  timestamp: string;

  type: SwingType;
}

export interface BreakOfStructure {
  detected: boolean;

  direction:
    | "bullish"
    | "bearish"
    | null;

  price: number | null;

  candleIndex: number | null;
}

export interface ChangeOfCharacter {
  detected: boolean;

  direction:
    | "bullish"
    | "bearish"
    | null;

  price: number | null;

  candleIndex: number | null;
}

export interface MarketStructure {
  trend: TrendDirection;

  swingHighs: SwingPoint[];

  swingLows: SwingPoint[];

  bos: BreakOfStructure;

  choch: ChangeOfCharacter;
}