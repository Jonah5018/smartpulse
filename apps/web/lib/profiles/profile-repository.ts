import { normalizeMarketSymbols } from "@/lib/market/market-universe";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  TraderProfile,
  TraderProfileInput,
} from "./profile-types";

export class ProfileRepository {
  static async create(
    client: SupabaseClient,
    profile: TraderProfileInput
  ): Promise<TraderProfile> {
    const { data, error } = await client
      .from("profiles")
      .upsert(profile, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("========== SUPABASE INSERT ERROR ==========");
      console.error("Profile being inserted:");
      console.dir(profile, { depth: null });

      console.error("Supabase error:");
      console.error("Postgres Code:", error.code);
console.error("Message:", error.message);
console.error("Details:", error.details);
console.error("Hint:", error.hint);

      console.error("==========================================");

      throw error;
    }

    return data as TraderProfile;
  }

  static async findById(
    client: SupabaseClient,
    authUserId: string
  ): Promise<TraderProfile | null> {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;
    const profile = data as TraderProfile;
    return { ...profile, favorite_markets: normalizeMarketSymbols(profile.favorite_markets ?? []) };
  }

  static async updateOnboarding(
    client: SupabaseClient,
    authUserId: string,
    updates: Partial<TraderProfileInput>
  ): Promise<TraderProfile> {
    const { data, error } = await client
      .from("profiles")
      .update(updates)
      .eq("auth_user_id", authUserId)
      .select()
      .single();

    if (error) {
      console.error("========== UPDATE PROFILE ERROR ==========");
      console.dir(error, { depth: null });
      throw error;
    }

    return data as TraderProfile;
  }

  static async delete(
    client: SupabaseClient,
    profileId: string
  ): Promise<void> {
    const { error } = await client
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (error) throw error;
  }
}
