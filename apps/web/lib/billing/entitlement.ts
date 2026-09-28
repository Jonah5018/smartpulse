import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlan =
  | "basic"
  | "pro"
  | "elite";

export type EntitlementStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "suspended";

export type EffectivePlan =
  | "none"
  | SubscriptionPlan;

interface EntitlementRow {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: EntitlementStatus;
  trial_plan: SubscriptionPlan | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_started_at: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

export interface EffectiveEntitlement {
  entitlement: EntitlementRow | null;

  effectivePlan: EffectivePlan;

  hasPaidAccess: boolean;
  hasTrialAccess: boolean;

  trialActive: boolean;
  trialExpired: boolean;

  subscriptionActive: boolean;

  canUseBasic: boolean;
  canUsePro: boolean;
  canUseElite: boolean;

  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
}

function isFuture(
  value: string | null
): boolean {
  if (!value) {
    return false;
  }

  const timestamp =
    new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return timestamp > Date.now();
}

export async function getEffectiveEntitlement(
  supabase: SupabaseClient
): Promise<EffectiveEntitlement> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      entitlement: null,

      effectivePlan: "none",

      hasPaidAccess: false,
      hasTrialAccess: false,

      trialActive: false,
      trialExpired: false,

      subscriptionActive: false,

      canUseBasic: false,
      canUsePro: false,
      canUseElite: false,

      trialEndsAt: null,
      currentPeriodEndsAt: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("subscription_entitlements")
    .select(
      [
        "id",
        "user_id",
        "plan",
        "status",
        "trial_plan",
        "trial_started_at",
        "trial_ends_at",
        "subscription_started_at",
        "current_period_starts_at",
        "current_period_ends_at",
        "cancel_at_period_end",
        "canceled_at",
      ].join(",")
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Entitlement lookup failed.",
      {
        code: error.code,
      }
    );

    throw new Error(
      "Unable to determine account entitlement."
    );
  }

  const entitlement =
    data as EntitlementRow | null;

  if (!entitlement) {
    return {
      entitlement: null,

      effectivePlan: "none",

      hasPaidAccess: false,
      hasTrialAccess: false,

      trialActive: false,
      trialExpired: false,

      subscriptionActive: false,

      canUseBasic: false,
      canUsePro: false,
      canUseElite: false,

      trialEndsAt: null,
      currentPeriodEndsAt: null,
    };
  }

  const trialActive =
    entitlement.status === "trialing" &&
    isFuture(
      entitlement.trial_ends_at
    );

  const trialExpired =
    entitlement.trial_ends_at !== null &&
    !isFuture(
      entitlement.trial_ends_at
    );

  const activePaidStatus =
    entitlement.status === "active" &&
    isFuture(
      entitlement.current_period_ends_at
    );

  const canceledButStillPaid =
    entitlement.status === "canceled" &&
    isFuture(
      entitlement.current_period_ends_at
    );

  const subscriptionActive =
    activePaidStatus ||
    canceledButStillPaid;

  const hasTrialAccess =
    trialActive &&
    entitlement.trial_plan !== null;

  const hasPaidAccess =
    subscriptionActive;

  let effectivePlan: EffectivePlan =
    "none";

  if (
    hasTrialAccess &&
    entitlement.trial_plan
  ) {
    effectivePlan =
      entitlement.trial_plan;
  } else if (hasPaidAccess) {
    effectivePlan =
      entitlement.plan;
  }

  const canUseBasic =
    effectivePlan === "basic" ||
    effectivePlan === "pro" ||
    effectivePlan === "elite";

  const canUsePro =
    effectivePlan === "pro" ||
    effectivePlan === "elite";

  const canUseElite =
    effectivePlan === "elite";

  return {
    entitlement,

    effectivePlan,

    hasPaidAccess,
    hasTrialAccess,

    trialActive,
    trialExpired,

    subscriptionActive,

    canUseBasic,
    canUsePro,
    canUseElite,

    trialEndsAt:
      entitlement.trial_ends_at,

    currentPeriodEndsAt:
      entitlement.current_period_ends_at,
  };
}