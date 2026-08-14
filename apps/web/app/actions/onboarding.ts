"use server";

import { ProvisionTraderAccount } from "@/lib/application";
import type { TraderProfileDraft } from "@/lib/profiles";

export async function completeOnboarding(
  draft: TraderProfileDraft
) {
  try {
    return await ProvisionTraderAccount.execute(draft);
  } catch (error) {
    console.error("========== ONBOARDING ERROR ==========");

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.dir(error, { depth: null });
    }

    console.error("======================================");

    throw error;
  }
}