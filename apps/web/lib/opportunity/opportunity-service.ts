import {
  OpportunityEngine,
} from "./opportunity-engine";

import type {
  Opportunity,
} from "./opportunity-types";

import type {
  TraderAnalysisProfile,
} from "@/lib/multi-timeframe";

export class OpportunityService {
  static async current(
    symbol: string,
    profile?: TraderAnalysisProfile
  ): Promise<Opportunity> {
    return OpportunityEngine.current(
      symbol,
      profile
    );
  }
}