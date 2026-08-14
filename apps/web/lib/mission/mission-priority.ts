import type {
  MissionItem,
} from "./mission-types";

export class MissionPriorityEngine {
  static rank(
    items: MissionItem[]
  ): MissionItem[] {
    const weight = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...items].sort(
      (a, b) =>
        weight[b.priority] -
        weight[a.priority]
    );
  }
}