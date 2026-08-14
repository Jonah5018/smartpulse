import type {
  Mission,
} from "./mission-types";

import {
  ContextService,
} from "@/lib/context";

import {
  OpportunityService,
} from "@/lib/opportunity";

export class MissionEngine {
  static async current(): Promise<Mission> {
    const context =
      ContextService.current();

    const opportunity =
      await OpportunityService.current(
        "GBP/USD"
      );

    return {
      title:
        "Today's Trading Mission",

      description:
        `${opportunity.summary} ` +
        `Current session: ${context.session}.`,

      priority:
        context.isMarketOpen
          ? "high"
          : "medium",

      confidence:
        opportunity.confidence,

      action:
        context.isMarketOpen
          ? "Monitor confirmation before entry."
          : "Prepare your watchlist before the next trading session.",
    };
  }
}