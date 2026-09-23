import {
  redirect,
} from "next/navigation";

import {
  LegalAcceptanceRepository,
} from "@/lib/legal/legal-acceptance-repository";

import {
  ProfileRepository,
} from "@/lib/profiles/profile-repository";

import {
  createClient,
} from "@/lib/supabase/server";

export async function redirectIfAuthenticated() {
  const client =
    await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return;
  }

  const hasCurrentLegalAcceptance =
    await LegalAcceptanceRepository
      .hasCurrentAcceptance(
        client,
        user.id
      );

  if (!hasCurrentLegalAcceptance) {
    redirect("/legal-consent");
  }

  const profile =
    await ProfileRepository.findById(
      client,
      user.id
    );

  if (
    !profile ||
    !profile.onboarding_completed
  ) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}