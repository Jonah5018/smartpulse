import { redirect } from "next/navigation";

import type { TraderContext } from "./trader-context";

import { createClient } from "@/lib/supabase/server";

import { ProfileRepository } from "@/lib/profiles/profile-repository";

export async function requireTrader(): Promise<TraderContext> {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile =
    await ProfileRepository.findById(
      client,
      user.id
    );

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return {
    user,
    profile,
  };
}