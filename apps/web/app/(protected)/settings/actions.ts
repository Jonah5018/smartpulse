"use server";
import { requireTrader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileRepository } from "@/lib/profiles/profile-repository";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/journal/entry-model";
import type { LearningMode } from "@/lib/profiles/profile-types";

export async function updateSettings(_previous: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireTrader();
  const first_name = String(form.get("first_name") ?? "").trim();
  const last_name = String(form.get("last_name") ?? "").trim();
  const timezone = String(form.get("timezone") ?? "").trim();
  const learning_mode = String(form.get("learning_mode") ?? "");
  if (!first_name || !last_name || first_name.length > 80 || last_name.length > 80) return { error: "Enter first and last names, each under 80 characters." };
  if (!["learning", "intermediate", "advanced", "professional"].includes(learning_mode)) return { error: "Choose a valid learning mode." };
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format(); } catch { return { error: "Enter a valid timezone such as Africa/Lagos." }; }
  try { await ProfileRepository.updateOnboarding(await createClient(), user.id, { first_name, last_name, timezone, learning_mode: learning_mode as LearningMode }); }
  catch { return { error: "Your preferences could not be saved. Please try again." }; }
  revalidatePath("/", "layout");
  return { success: "Preferences saved." };
}
