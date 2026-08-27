export type OrderBlockDirection =
  | "bullish"
  | "bearish";

export interface OrderBlock {
  detected: boolean;

  direction: OrderBlockDirection | null;

  low: number | null;

  high: number | null;

  midpoint: number | null;

  candleIndex: number | null;

  confidence: number;
}