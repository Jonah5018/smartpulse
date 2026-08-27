import {
  ConfluenceEngine,
} from "./confluence-engine";

import type {
  FocusScore,
} from "@/lib/focus-score";

import type {
  LiquidityAnalysis,
} from "@/lib/liquidity";

import type {
  RegimeAnalysis,
} from "@/lib/market-regime";

import type {
  MacroContext,
} from "@/lib/macro";

export class ConfluenceService {
  calculate(
    focus: FocusScore,
    liquidity: LiquidityAnalysis,
    regime: RegimeAnalysis,
    macro: MacroContext
  ) {
    return ConfluenceEngine.calculate(
      focus,
      liquidity,
      regime,
      macro
    );
  }
}

export const confluenceService =
  new ConfluenceService();