import type {
  MarketSessionStatus,
} from "./market-types";

import {
  MarketSessionService as ProductionMarketSessionService,
} from "@/lib/market-session";

export class MarketSessionService {
  static current(): MarketSessionStatus {
    return ProductionMarketSessionService.current();
  }
}