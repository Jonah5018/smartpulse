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

    return await ProfileRepository.create(
      client,
      profile
    );
  }
}