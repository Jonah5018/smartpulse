export type PDZone =
  | "premium"
  | "discount"
  | "equilibrium";

export interface PremiumDiscountArray {
  swingHigh: number;
  swingLow: number;
  equilibrium: number;
  currentPrice: number;
  zone: PDZone;
}