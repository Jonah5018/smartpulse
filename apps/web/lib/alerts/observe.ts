import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { InstitutionalSetupService } from "@/lib/institutional-setup";
import { MarketAvailabilityService } from "@/lib/market-session/market-availability-service";
import {
  evaluateEntitlement,
  type EntitlementRow,
} from "@/lib/billing/entitlement";
import { canAccessMarket } from "@/lib/billing/market-access";

export async function observeAlerts(client: SupabaseClient, userId?: string) {
  let query = client
    .from("market_alert_rules")
    .select("id,user_id,symbol")
    .eq("enabled", true)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(3);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw new Error("Alert rules are unavailable.");
  let checked = 0,
    unavailable = 0;
  for (const rule of data ?? []) {
    try {
      const { data: billing, error: billingError } = await client
        .from("subscription_entitlements")
        .select("*")
        .eq("user_id", rule.user_id)
        .maybeSingle();
      if (billingError) throw new Error("Entitlement unavailable.");
      const entitlement = evaluateEntitlement(billing as EntitlementRow | null);
      if (
        !entitlement.canUsePro ||
        !canAccessMarket(entitlement.effectivePlan, rule.symbol)
      )
        continue;
      if (!MarketAvailabilityService.current(rule.symbol).isOpen) continue;
      const setup = await InstitutionalSetupService.current(
        rule.symbol,
        "15min",
        200,
      );
      if (!setup.priceAction) {
        unavailable++;
        continue;
      }
      const state =
        setup.state + ":" + setup.direction + ":" + setup.priceAction.state;
      const { error: writeError } = await client.rpc("observe_market_alert", {
        p_rule: rule.id,
        p_state: state,
        p_observed: new Date().toISOString(),
      });
      if (writeError) throw new Error("Alert state could not be recorded.");
      checked++;
    } catch {
      unavailable++;
    } finally {
      await client
        .from("market_alert_rules")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("id", rule.id)
        .eq("user_id", rule.user_id);
    }
  }
  return { checked, unavailable };
}
