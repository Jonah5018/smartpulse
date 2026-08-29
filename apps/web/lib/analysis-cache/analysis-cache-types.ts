import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  Opportunity,
} from "@/lib/opportunity";

import type {
  FocusScore,
} from "@/lib/focus-score";

import type {
  OpportunityDecision,
} from "@/lib/decision";

export interface AnalysisSnapshot {
  symbol: string;

  generatedAt: string;

  setup: InstitutionalSetup;

  opportunity: Opportunity;

  focus: FocusScore;

  decision: OpportunityDecision;
}