import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  MacroAnalysisResult,
} from "@/lib/macro";

import type {
  AIContext,
} from "./intelligence-types";

export class AIContextBuilder {
  static build(
    setup: InstitutionalSetup,
    macro: MacroAnalysisResult
  ): AIContext {
    return {
      symbol: setup.symbol,

      timeframe: setup.timeframe,

      setup,

      macro,
    };
  }
}