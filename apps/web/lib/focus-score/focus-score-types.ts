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


/**
 * Explainable contribution of one Focus Score factor.
 *
 * rawScore:
 *   The factor's normalized 0-100 strength.
 *
 * weight:
 *   How much influence the factor has on
 *   the final Focus Score.
 *
 * contribution:
 *   The number of points this factor contributes
 *   to the final 100-point score.
 */
export interface FocusScoreBreakdownItem {
  rawScore: number;

  weight: number;

  contribution: number;
}


/**
 * Explainable Focus Score breakdown.
 */
export type FocusScoreBreakdown =
  Record<
    keyof FocusScoreFactors,
    FocusScoreBreakdownItem
  >;


export interface FocusScore {
  symbol: string;

  score: number;

  priority: FocusPriority;

  action: FocusAction;

  opportunity: Opportunity;

  factors: FocusScoreFactors;

  breakdown: FocusScoreBreakdown;

  reason: string;

  warnings: string[];
}