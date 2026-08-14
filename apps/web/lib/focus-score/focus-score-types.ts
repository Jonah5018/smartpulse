import type {
  Opportunity,
} from "@/lib/opportunity";

export type FocusPriority =
  | "ignore"
  | "low"
  | "watch"
  | "high"
  | "critical";

export type FocusAction =
  | "ignore"
  | "monitor"
  | "wait"
  | "prepare"
  | "review_now"
  | "watch";

export interface FocusScoreFactors {
  opportunity: number;

  setupReadiness: number;

  multiTimeframeAlignment: number;

  liquidity: number;

  displacement: number;

  entryQuality: number;

  riskReward: number;

  sessionQuality: number;

  calendarRisk: number;
}

export interface FocusScore {
  symbol: string;

  score: number;

  priority: FocusPriority;

  action: FocusAction;

  opportunity: Opportunity;

  factors: FocusScoreFactors;

  reason: string;

  warnings: string[];
}