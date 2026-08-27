import {
  InstitutionalSetupService,
} from "@/lib/institutional-setup";

import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import {
  DecisionEngine,
} from "./decision-engine";

import type {
  OpportunityDecision,
} from "./decision-types";

export class DecisionService {
  static async current(
    symbol: string
  ): Promise<OpportunityDecision> {
    const setup =
      await InstitutionalSetupService.current(
        symbol,
        "15min",
        200
      );

    return DecisionEngine.evaluate(
      setup
    );
  }

  /**
   * Evaluate a decision from an already
   * calculated Institutional Setup.
   *
   * No market-data request is performed.
   */
  static evaluate(
    setup: InstitutionalSetup
  ): OpportunityDecision {
    return DecisionEngine.evaluate(
      setup
    );
  }
}