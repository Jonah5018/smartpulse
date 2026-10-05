import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  getEffectiveEntitlement,
  evaluateEntitlement,
} from "@/lib/billing/entitlement";
import { tradingCapabilities } from "./capabilities";

export function tradingConfigured() {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}
export function tradingAdmin() {
  if (!tradingConfigured())
    throw new Error("Trading storage is not configured.");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
export async function tradingActor(requireEntitlement = true) {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new Error("Sign in to continue.");
  const entitlement = requireEntitlement
    ? await getEffectiveEntitlement(client)
    : evaluateEntitlement(null);
  if (
    requireEntitlement &&
    !tradingCapabilities(entitlement.effectivePlan).paperTrading
  )
    throw new Error("An active Pro or Elite plan is required.");
  return { user, client, entitlement };
}
export function paperEnabled() {
  return process.env.SMARTPULSE_PAPER_ENABLED === "true";
}
