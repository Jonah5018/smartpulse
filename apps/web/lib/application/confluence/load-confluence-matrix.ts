import {
  confluenceService,
} from "@/lib/confluence";

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

export class LoadConfluenceMatrix {
  static execute(
    focus: FocusScore,
    liquidity: LiquidityAnalysis,
    regime: RegimeAnalysis,
    macro: MacroContext
  ) {
    return confluenceService.calculate(
      focus,
      liquidity,
      regime,
      macro
    );
  }
}