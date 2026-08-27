export interface ConfluenceBreakdown {
  structure: number;
  liquidity: number;
  orderBlock: number;
  fairValueGap: number;
  premiumDiscount: number;
  displacement: number;
}

export interface ConfluenceResult {
  score: number;

  grade:
    | "C"
    | "B"
    | "A"
    | "A+";

  confirmations: number;

  breakdown: ConfluenceBreakdown;

  valid: boolean;
}