import type {
  LiquidityMap,
} from "@/lib/institutional/liquidity";

import type {
  ConfluenceResult,
} from "@/lib/institutional/confluence";

import type {
  Displacement,
} from "@/lib/institutional/displacement";

import type {
  InstitutionalExplanation,
} from "@/lib/institutional/explainability";

export type SetupDirection =
  | "buy"
  | "sell"
  | "neutral";

export type SetupState =
  | "no_setup"
  | "forming"
  | "ready";

export type SetupQuality =
  | "low"
  | "moderate"
  | "high"
  | "exceptional";

export type SetupContext =
  | "with_context"
  | "inside_range"
  | "countertrend"
  | "unclear";

export interface PriceZone {
  low: number;
  high: number;
  midpoint: number;
}

export interface RiskRewardPlan {
  entry: number;
  stopLoss: number;
  target: number;
  risk: number;
  reward: number;
  ratio: number;
}

export interface InstitutionalSetup {
  symbol: string;

  timeframe: string;

  state: SetupState;

  direction: SetupDirection;

  quality: SetupQuality;

  confidence: number;

  confluence: ConfluenceResult;

  explainability: InstitutionalExplanation;

  marketStructure:
    | "bullish"
    | "bearish"
    | "range";

  structureEvent:
    | "none"
    | "bos"
    | "mss"
    | "choch";

  setupContext: SetupContext;

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

  liquiditySweep:
    | "buy_side"
    | "sell_side"
    | null;

  liquidity: LiquidityMap;

  entryZone: PriceZone | null;

  invalidation: number | null;

  targetLiquidity: number | null;

  riskReward: RiskRewardPlan | null;

  displacement: Displacement;

  fairValueGap: PriceZone | null;

  summary: string;

  explanation: string;
}