import { LoadDailyBriefing } from "../daily-briefing/load-daily-briefing";
import { LoadMarketPulse } from "../market/load-market-pulse";

import { requireWorkspace } from "@/lib/auth";

export class LoadDashboard {
  static async execute() {
    const workspace =
      await requireWorkspace();

    const [market, briefing] =
      await Promise.all([
        LoadMarketPulse.execute(),

        LoadDailyBriefing.execute(
          workspace.profile.full_name
        ),
      ]);

    return {
      workspace,
      market,
      briefing,
    };
  }
}