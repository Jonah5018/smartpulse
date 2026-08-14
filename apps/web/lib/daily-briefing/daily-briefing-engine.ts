import {
  DailyBriefingBuilder,
} from "./daily-briefing-builder";

import type {
  DailyBriefing,
} from "./daily-briefing-types";

export class DailyBriefingEngine {
  static async generate(
    fullName: string
  ): Promise<DailyBriefing> {
    return DailyBriefingBuilder.build(
      fullName
    );
  }
}