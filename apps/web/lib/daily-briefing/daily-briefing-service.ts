import { DailyBriefingEngine } from "./daily-briefing-engine";

export class DailyBriefingService {
  static create(fullName: string) {
    return DailyBriefingEngine.generate(fullName);
  }
}