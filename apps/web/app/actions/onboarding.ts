"use server";

import {
  ProvisionTraderAccount,
} from "@/lib/application";

import type {
  TraderProfileDraft,
} from "@/lib/profiles";

export async function completeOnboarding(
  draft: TraderProfileDraft
) {
  try {
    const profile =
      await ProvisionTraderAccount.execute(
        draft
      );

    return {
      success: true as const,
      profile,
    };
  } catch (error) {
    console.error(
      "Onboarding completion failed.",
      {
        error:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    return {
      success: false as const,

      message:
        "We couldn't finish setting up your account. Please try again.",
    };
  }
}