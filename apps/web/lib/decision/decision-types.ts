export type DecisionState =
  | "discovered"
  | "forming"
  | "ready"
  | "confirmed"
  | "active"
  | "completed"
  | "invalidated";


export type DecisionPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";


export type DecisionAction =
  | "observe"
  | "monitor"
  | "wait_for_entry"
  | "prepare"
  | "confirm"
  | "manage"
  | "stand_aside";


export interface OpportunityDecision {
  state: DecisionState;

  priority: DecisionPriority;

  confidence: number;

  message: string;

  nextAction: string;

  action: DecisionAction;

  setupState:
    | "no_setup"
    | "forming"
    | "ready";

  setupQuality:
    | "low"
    | "moderate"
    | "high"
    | "exceptional";

  setupContext:
    | "with_context"
    | "inside_range"
    | "countertrend"
    | "unclear";

  multiTimeframeAlignment:
    | "aligned"
    | "partially_aligned"
    | "countertrend"
    | "range_context";

  hasLiquiditySweep: boolean;

  hasDisplacement: boolean;

  hasFairValueGap: boolean;

  hasEntryZone: boolean;

  hasRiskRewardPlan: boolean;

  riskRewardRatio:
    | number
    | null;

  warnings: string[];
}