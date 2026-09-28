import { createClient } from "@/lib/supabase/server";

import {
  ProfileRepository,
} from "@/lib/profiles/profile-repository";

import {
  ProfileService,
} from "@/lib/profiles/profile-service";

import type {
  RegistrationIdentity,
  TraderProfile,
  TraderProfileDraft,
} from "@/lib/profiles";

export class ProvisionTraderAccount {
  static async execute(
    draft: TraderProfileDraft
  ): Promise<TraderProfile> {
    const client =
      await createClient();

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "User is not authenticated."
      );
    }

    if (!user.email_confirmed_at) {
      throw new Error(
        "Email verification is required."
      );
    }

    const metadata =
      user.user_metadata;

    const identity: RegistrationIdentity = {
      first_name:
        metadata.first_name,

      other_names:
        metadata.other_names ??
        null,

      last_name:
        metadata.last_name,

      email:
        user.email ?? "",

      timezone:
        metadata.timezone ??
        null,
    };

    const profile =
      ProfileService.buildProfile(
        identity,
        draft,
        user.id
      );

    /*
     * Persist the validated onboarding data first,
     * but deliberately keep onboarding incomplete.
     *
     * This prevents dashboard access if entitlement
     * provisioning fails.
     */
    await ProfileRepository.create(
      client,
      {
        ...profile,

        onboarding_completed:
          false,
      }
    );

    /*
     * Issue or recover the user's one-time Pro trial.
     *
     * The database function is idempotent, so retries
     * return the existing entitlement without extending
     * the original trial end date.
     */
    const {
      error: trialError,
    } = await client.rpc(
      "start_pro_trial"
    );

    if (trialError) {
      console.error(
        "Trial provisioning failed during onboarding.",
        {
          code: trialError.code,
        }
      );

      throw new Error(
        "Unable to provision account access."
      );
    }

    /*
     * Only mark onboarding complete after trial
     * provisioning succeeds.
     */
    return await ProfileRepository.updateOnboarding(
      client,
      user.id,
      {
        onboarding_completed:
          true,
      }
    );
  }
}