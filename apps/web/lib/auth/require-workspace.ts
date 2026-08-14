import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { WorkspaceContext } from "@/lib/workspace";

export async function requireWorkspace() {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace =
    await WorkspaceContext.load(user.id);

  if (!workspace) {
    redirect("/onboarding");
  }

  if (
    !workspace.profile.onboarding_completed
  ) {
    redirect("/onboarding");
  }

  return workspace;
}