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


  static evaluate(
    setup: InstitutionalSetup
  ): OpportunityDecision {
    return DecisionEngine.evaluate(
      setup
    );
  }
}