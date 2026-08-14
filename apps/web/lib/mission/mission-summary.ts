import type {
  DailyMission,
} from "./mission-types";

export class MissionSummary {
  static build(
    mission: DailyMission
  ): string {
    return `Today's focus score is ${mission.score}. You have ${mission.items.length} priority items.`;
  }
}