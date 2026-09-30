import {
  requireProAccess,
} from "@/lib/billing/access";

import {
  LoadMarketIntelligence,
} from "./load-market-intelligence";

import { canAccessMarket } from "@/lib/billing/market-access";
import { MarketDataError } from "@/lib/providers/market-data";

export class LoadProtectedMarketIntelligence {
  static async execute(
    symbol: string,
    watchlist: string[] = []
  ) {
    const entitlement = await requireProAccess();

    if (!canAccessMarket(entitlement.effectivePlan, symbol)) {
      throw new MarketDataError("This instrument is unavailable for the current plan.", {
        status: 403,
        retryable: false,
      });
    }

    return await LoadMarketIntelligence.execute(
      symbol,
      watchlist
    );
  }
}
