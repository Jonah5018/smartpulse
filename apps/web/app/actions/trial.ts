"use server";

import { createClient } from "@/lib/supabase/server";

export async function startProTrial() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message:
        "You must be signed in to start your trial.",
    };
  }

  if (!user.email_confirmed_at) {
    return {
      success: false,
      message:
        "Verify your email before starting your SmartPulse trial.",
    };
  }

  /*
   * Require onboarding completion before
   * trial activation.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "onboarding_completed"
    )
    .eq(
      "auth_user_id",
      user.id
    )
    .maybeSingle();

  if (profileError) {
    console.error(
      "Trial profile verification failed.",
      {
        code: profileError.code,
      }
    );

    return {
      success: false,
      message:
        "We couldn't verify your account readiness for the trial.",
    };
  }

  if (
    !profile?.onboarding_completed
  ) {
    return {
      success: false,
      message:
        "Complete onboarding before starting your SmartPulse trial.",
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "start_pro_trial"
  );

  if (error) {
    console.error(
      "Pro trial issuance failed.",
      {
        code: error.code,
      }
    );

    return {
      success: false,
      message:
        "We couldn't start your trial. It may already have been used on this account.",
    };
  }

  return {
    success: true,
    entitlement: data,
  };
}