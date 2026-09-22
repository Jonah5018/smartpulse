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
      .upsert(profile, {
        onConflict: "id",
      })
      .select()
      .single();

    if (error) {
      console.error("Profile creation failed.", {
        code: error.code,
      });

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

    if (error) {
      console.error("Profile lookup failed.", {
        code: error.code,
      });

      throw error;
    }

    if (!data) {
      return null;
    }

    const profile = data as TraderProfile;

    return {
      ...profile,
      favorite_markets: normalizeMarketSymbols(
        profile.favorite_markets ?? []
      ),
    };
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
      console.error("Profile update failed.", {
        code: error.code,
      });

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

    if (error) {
      console.error("Profile deletion failed.", {
        code: error.code,
      });

      throw error;
    }
  }
}