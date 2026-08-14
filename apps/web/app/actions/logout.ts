"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function signOutUser() {
  const client = await createClient();

  const { error } =
    await client.auth.signOut();

  if (error) {
    console.error(
      "Failed to sign out:",
      error.message
    );

    throw new Error(
      "Unable to sign out."
    );
  }

  redirect("/login");
}