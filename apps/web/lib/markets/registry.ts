import { getActiveMarketUniverse } from "@/lib/market/market-universe";
import { canAccessMarket } from "@/lib/billing/market-access";
import type { MarketInstrument, SubscriptionPlan } from "./types";

// Compatibility projection for onboarding; no separate instrument definitions.
export const MARKET_REGISTRY: MarketInstrument[] = getActiveMarketUniverse().map(
  (instrument) => ({
    symbol: instrument.id,
    displayName: instrument.symbol,
    assetClass: instrument.assetClass,
    category:
      instrument.assetClass === "forex"
        ? instrument.category === "major"
          ? "major"
          : "minor"
        : instrument.assetClass,
    baseCurrency: instrument.baseAsset,
    quoteCurrency: instrument.quoteAsset,
    priority: instrument.tier === "core" ? 5 : instrument.tier === "secondary" ? 4 : 3,
    tradingSessions: [],
    tradingDays:
      instrument.assetClass === "crypto" ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5],
    supportedPlans: (["starter", "pro", "elite"] as SubscriptionPlan[]).filter((plan) =>
      canAccessMarket(
        plan === "starter" ? "basic" : plan === "trial" ? "none" : plan,
        instrument.id,
      ),
    ),
    trialEnabled: false,
    pulseModules: ["technical", "liquidity"],
  }),
);
