import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ProfileRepository } from "@/lib/profiles/profile-repository";

export async function redirectIfAuthenticated() {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return;
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