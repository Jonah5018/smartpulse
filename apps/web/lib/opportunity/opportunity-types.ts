export type OpportunityState =
  | "no_setup"
  | "forming"
  | "ready"
  | "executed"
  | "expired";

export type OpportunityDirection =
  | "buy"
  | "sell"
  | "neutral";

export type OpportunityQuality =
  | "low"
  | "moderate"
  | "high"
  | "exceptional";

export type OpportunityContext =
  | "with_context"
  | "inside_range"
  | "countertrend"
  | "unclear";

export interface OpportunityRiskReward {
  entry: number;

  stopLoss: number;

  target: number;

  risk: number;

  reward: number;

  ratio: number;
}

export interface OpportunityEntryZone {
  low: number;

  high: number;

  midpoint: number;
}

export interface Opportunity {
  symbol: string;

  state: OpportunityState;

  confidence: number;

  direction: OpportunityDirection;

  quality: OpportunityQuality;

  setupContext: OpportunityContext;

  structure: string;

  structureEvent:
    | "none"
    | "bos"
    | "mss"
    | "choch";

  higherTimeframeBias:
    | "bullish"
    | "bearish"
    | "neutral";

  contextTimeframe: string;

  contextTrend:
    | "bullish"
    | "bearish"
    | "range";

  structureTimeframe: string;

  executionTimeframe: string;

  multiTimeframeAlignment:
    | "aligned"
    | "partially_aligned"
    | "countertrend"
    | "range_context";

  nearestBuySideLiquidity:
    | number
    | null;

  nearestSellSideLiquidity:
    | number
    | null;

  liquiditySweep:
    | "buy_side"
    | "sell_side"
    | null;

  displacement:
    | "bullish"
    | "bearish"
    | null;

  entryZone:
    | OpportunityEntryZone
    | null;

  invalidation:
    | number
    | null;

  targetLiquidity:
    | number
    | null;

  riskReward:
    | OpportunityRiskReward
    | null;

  summary: string;

  explanation: string;
}