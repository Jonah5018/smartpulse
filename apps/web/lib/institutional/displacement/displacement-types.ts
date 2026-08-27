export type DisplacementDirection =
  | "bullish"
  | "bearish"
  | null;

export interface Displacement {
  detected: boolean;

  direction: DisplacementDirection;

  strength: number;

  bodyRatio: number;

  impulseSize: number;

  candleIndex: number | null;
}