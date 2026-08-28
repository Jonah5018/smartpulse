export type PriceLocation =
  | "premium"
  | "discount"
  | "equilibrium";

export interface DealingRangeAnalysis {
  symbol: string;

  timeframe: "1h";

  swingHigh: number;

  swingLow: number;

  equilibrium: number;

  oteHigh: number;

  oteLow: number;

  currentPrice: number;

  location: PriceLocation;

  inOTE: boolean;

  premiumPercentage: number;

  discountPercentage: number;

  summary: string;
}