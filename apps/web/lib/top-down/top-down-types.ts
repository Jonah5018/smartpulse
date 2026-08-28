import type {
  MultiTimeframeAnalysis,
} from "@/lib/multi-timeframe";

import type {
  DealingRangeAnalysis,
} from "@/lib/dealing-range";

import type {
  LiquidityNarrativeAnalysis,
} from "@/lib/liquidity-narrative";

export type InstitutionalDecision =
  | "buy"
  | "sell"
  | "wait";

export interface TopDownReport {
  symbol: string;

  higherTimeframe: MultiTimeframeAnalysis;

  dealingRange: DealingRangeAnalysis;

  liquidity: LiquidityNarrativeAnalysis;

  decision: InstitutionalDecision;

  confidence: number;

  narrative: string;
}