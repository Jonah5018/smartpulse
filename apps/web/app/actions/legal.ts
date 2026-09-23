"use server";

import { redirect } from "next/navigation";

import {
  LegalAcceptanceRepository,
} from "@/lib/legal/legal-acceptance-repository";

import {
  ProfileRepository,
} from "@/lib/profiles/profile-repository";

import {
  createClient,
} from "@/lib/supabase/server";

export async function acceptCurrentLegalTerms(
  formData: FormData
) {
  const accepted =
    formData.get("accepted") === "on";

  if (!accepted) {
    redirect(
      "/legal-consent?error=required"
    );
  }

  const client =
    await createClient();

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    redirect(
      "/login?returnTo=/legal-consent"
    );
  }

  let acceptanceFailed = false;

  try {
    await LegalAcceptanceRepository
      .recordCurrentAcceptance(
        client
      );
  } catch {
    acceptanceFailed = true;
  }

  if (acceptanceFailed) {
    redirect(
      "/legal-consent?error=save_failed"
    );
  }

  let onboardingComplete = false;

  try {
    const profile =
      await ProfileRepository.findById(
        client,
        user.id
      );

    onboardingComplete =
      Boolean(
        profile?.onboarding_completed
      );
  } catch (error) {
    console.error(
      "Post-acceptance profile lookup failed.",
      {
        error:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );
  }

  redirect(
    onboardingComplete
      ? "/dashboard"
      : "/onboarding"
  );
}