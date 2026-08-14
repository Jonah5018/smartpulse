import { createClient } from "@/lib/supabase/server";

import { ProfileRepository } from "@/lib/profiles/profile-repository";
import { ProfileService } from "@/lib/profiles/profile-service";

import type {
  RegistrationIdentity,
  TraderProfile,
  TraderProfileDraft,
} from "@/lib/profiles";

export class ProvisionTraderAccount {
  static async execute(
    draft: TraderProfileDraft
  ): Promise<TraderProfile> {
    const client = await createClient();

    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (error) {
      throw error;
    }

    if (!user) {
      throw new Error("User is not authenticated.");
    }

    const metadata = user.user_metadata;

    const identity: RegistrationIdentity = {
  first_name: metadata.first_name,
  other_names: metadata.other_names ?? null,
  last_name: metadata.last_name,
  email: user.email ?? "",
  timezone: metadata.timezone ?? null,
};

    const profile =
  ProfileService.buildProfile(
    identity,
    draft,
    user.id
  );

return await ProfileRepository.updateOnboarding(
  client,
  user.id,
  {
    experience_level: profile.experience_level,
    learning_mode: profile.learning_mode,
    trading_styles: profile.trading_styles,
    preferred_timeframes: profile.preferred_timeframes,
    market_categories: profile.market_categories,
    favorite_markets: profile.favorite_markets,
    goals: profile.goals,
    challenges: profile.challenges,
    onboarding_completed: true,
  }
);
  }
}