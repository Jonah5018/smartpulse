import type { AssetClass } from "@/lib/markets";

export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional";

export type TradingStyle =
  | "scalping"
  | "day"
  | "swing"
  | "position";

export type Timeframe =
  | "M1"
  | "M5"
  | "M15"
  | "M30"
  | "H1"
  | "H4"
  | "D1"
  | "W1";

export interface OnboardingStep {
  id: number;
  key: string;
  title: string;
  description: string;
}

export type { AssetClass };