export interface MarketContext {
  session: string;

  isMarketOpen: boolean;

  overlap: string;

  marketPhase:
    | "pre-open"
    | "active"
    | "closing"
    | "closed";

  summary: string;
}