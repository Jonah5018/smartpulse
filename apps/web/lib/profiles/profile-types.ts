import type {
  ExperienceLevel,
  TradingStyle,
  Timeframe,
} from "@/lib/onboarding";

import type {
  AssetClass,
} from "@/lib/markets";

export type LearningMode =
  | "learning"
  | "intermediate"
  | "advanced"
  | "professional";

/**
 * Information collected during registration.
 */
export interface RegistrationIdentity {
  first_name: string;

  other_names: string | null;

  last_name: string;

  email: string;

  timezone: string | null;
}

/**
 * Information collected during onboarding.
 */
export interface TraderProfileDraft {
  experience_level?: ExperienceLevel;

  trading_styles: TradingStyle[];

  preferred_timeframes: Timeframe[];

  market_categories: AssetClass[];

  favorite_markets: string[];

  goals: string[];

  challenges: string[];

  learning_mode: LearningMode;
}

/**
 * Complete profile ready for persistence.
 */
export interface TraderProfileInput
  extends RegistrationIdentity,
    TraderProfileDraft {
  id: string;

  auth_user_id: string;

  onboarding_completed: boolean;
}

/**
 * Profile stored in the database and consumed
 * by the application.
 */
export interface TraderProfile
  extends TraderProfileInput {
  full_name: string;

  created_at: string;

  updated_at: string;
}