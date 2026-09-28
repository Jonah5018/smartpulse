import {
  requireProAccess,
} from "@/lib/billing/access";

import {
  LoadMarketIntelligence,
} from "./load-market-intelligence";

export class LoadProtectedMarketIntelligence {
  static async execute(
    symbol: string,
    watchlist: string[] = []
  ) {
    await requireProAccess();

    return await LoadMarketIntelligence.execute(
      symbol,
      watchlist
    );
  }
}