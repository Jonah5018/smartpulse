import {
  LoadDailyBriefing,
} from "../daily-briefing/load-daily-briefing";

import {
  LoadMarketPulse,
} from "../market/load-market-pulse";

import {
  requireWorkspace,
} from "@/lib/auth";

export class LoadDashboard {
  static async execute() {
    const workspace =
      await requireWorkspace();

    /*
     * The trader's watchlist is a preference,
     * not a restriction.
     *
     * LoadMarketPulse will:
     *
     * 1. Analyze the active market universe.
     * 2. Give the trader's watchlist priority.
     * 3. Discover strong opportunities outside
     *    the watchlist.
     */
    const market =
      await LoadMarketPulse.execute(
        workspace.profile.favorite_markets
      );

    const briefing =
      await LoadDailyBriefing.execute(
        workspace.profile.full_name,
        {
          session:
            market.session,

          topFocus:
            market.topFocus,

          opportunities:
            market.opportunities,

          marketSelection:
            market.marketSelection,
        },
        ("macroAnalysis" in market
          ? market.macroAnalysis
          : undefined) as Parameters<
          typeof LoadDailyBriefing.execute
        >[2]
      );

    return {
      workspace,

      market,

      briefing,
    };
  }
}