import type { EffectivePlan } from "./entitlement";
import { findInstrument, getActiveMarketUniverse } from "@/lib/market/market-universe";

// Market eligibility is independent of feature gates (Pulse remains Pro).
// Trial access uses the existing effectivePlan computed from trusted billing data.
export function canAccessMarket(plan: EffectivePlan, symbol: string): boolean {
  const instrument = findInstrument(symbol);

  if (!instrument?.enabled || plan === "none") {
    return false;
  }

  return (
    plan === "pro" ||
    plan === "elite" ||
    (plan === "basic" &&
      instrument.assetClass === "forex" &&
      instrument.category === "major")
  );
}

export function marketsForPlan(plan: EffectivePlan) {
  return getActiveMarketUniverse().filter((instrument) =>
    canAccessMarket(plan, instrument.id),
  );
}
