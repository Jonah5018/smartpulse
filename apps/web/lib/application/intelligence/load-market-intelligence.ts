import {
  InstitutionalSetupService,
} from "@/lib/institutional-setup";

import {
  FocusScoreService,
} from "@/lib/focus-score";

import {
  DecisionService,
} from "@/lib/decision";

export class LoadMarketIntelligence {
  static async execute(
    symbol: string
  ) {
    const setup =
      await InstitutionalSetupService.current(
        symbol,
        "15min",
        200
      );

    const focus =
      await FocusScoreService.current(
        symbol
      );

    const decision =
      DecisionService.evaluate(
        setup
      );

    return {
      symbol,

      setup,

      focus,

      decision,
    };
  }
}