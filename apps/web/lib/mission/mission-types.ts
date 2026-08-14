export interface Mission {
  title: string;

  description: string;

  priority:
    | "low"
    | "medium"
    | "high";

  confidence: number;

  action: string;
}

export interface MissionItem {
  title: string;

  description: string;

  priority:
    | "critical"
    | "high"
    | "medium"
    | "low";
}

export interface DailyMission {
  score: number;

  items: MissionItem[];
}