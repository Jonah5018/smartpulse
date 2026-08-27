import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  MacroAnalysisResult,
} from "@/lib/macro";

export interface AIContext {
  symbol: string;

  timeframe: string;

  setup: InstitutionalSetup;

  macro: MacroAnalysisResult;
}

export interface AIPromptPayload {
  system: string;

  user: string;
}