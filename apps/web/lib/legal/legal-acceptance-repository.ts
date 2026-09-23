import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  LEGAL_VERSIONS,
} from "./versions";

export class LegalAcceptanceRepository {
  static async hasCurrentAcceptance(
    client: SupabaseClient,
    userId: string
  ): Promise<boolean> {
    const {
      data,
      error,
    } = await client
      .from("legal_acceptances")
      .select("id")
      .eq("user_id", userId)
      .eq(
        "terms_version",
        LEGAL_VERSIONS.terms
      )
      .eq(
        "privacy_version",
        LEGAL_VERSIONS.privacy
      )
      .eq(
        "risk_disclosure_version",
        LEGAL_VERSIONS.riskDisclosure
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Legal acceptance lookup failed.",
        {
          code: error.code,
        }
      );

      throw error;
    }

    return Boolean(data);
  }

  static async recordCurrentAcceptance(
    client: SupabaseClient
  ): Promise<void> {
    const { error } = await client
      .from("legal_acceptances")
      .insert({
        terms_version:
          LEGAL_VERSIONS.terms,

        privacy_version:
          LEGAL_VERSIONS.privacy,

        risk_disclosure_version:
          LEGAL_VERSIONS.riskDisclosure,
      });

    /*
     * A retry may encounter the unique
     * constraint because this exact
     * acceptance already exists.
     *
     * Treat that as idempotent success.
     */
    if (error?.code === "23505") {
      return;
    }

    if (error) {
      console.error(
        "Legal acceptance creation failed.",
        {
          code: error.code,
        }
      );

      throw error;
    }
  }
}