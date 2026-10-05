"use server";
import { revalidatePath } from "next/cache";
import { tradingActor, tradingAdmin } from "@/lib/trading/server";
import { canAccessMarket } from "@/lib/billing/market-access";
import { findInstrument } from "@/lib/market/market-universe";
import { observeAlerts } from "@/lib/alerts/observe";
type State = { error?: string; success?: string };
export async function saveAlert(_state: State, form: FormData): Promise<State> {
  try {
    const { user, entitlement } = await tradingActor();
    const admin = tradingAdmin();
    const instrument = findInstrument(String(form.get("symbol")));
    if (
      !instrument ||
      !canAccessMarket(entitlement.effectivePlan, instrument.symbol)
    )
      return { error: "This market is not available for your plan." };
    const { error } = await admin
      .from("market_alert_rules")
      .upsert(
        {
          user_id: user.id,
          symbol: instrument.symbol,
          enabled: form.get("enabled") === "on",
        },
        { onConflict: "user_id,symbol" },
      );
    if (error) throw new Error("Storage unavailable");
    revalidatePath("/alerts");
    return { success: "Alert preference saved." };
  } catch {
    return {
      error:
        "Alert settings could not be saved. Check your access and server storage configuration.",
    };
  }
}
export async function checkAlerts(_state: State): Promise<State> {
  void _state;
  try {
    const { user } = await tradingActor();
    const result = await observeAlerts(tradingAdmin(), user.id);
    revalidatePath("/alerts");
    return {
      success:
        result.checked +
        " rules checked; " +
        result.unavailable +
        " temporarily unavailable. The first successful check establishes a baseline.",
    };
  } catch {
    return {
      error:
        "Alerts could not be checked. No market state has been fabricated.",
    };
  }
}
