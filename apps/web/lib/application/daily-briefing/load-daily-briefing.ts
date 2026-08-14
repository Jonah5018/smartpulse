import { DailyBriefingBuilder } from "@/lib/daily-briefing";

export class LoadDailyBriefing {
  static async execute(fullName: string) {
    return DailyBriefingBuilder.build(fullName);
  }
}