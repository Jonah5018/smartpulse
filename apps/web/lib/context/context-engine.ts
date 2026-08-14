import type {
  MarketContext,
} from "./context-types";

import {
  MarketSessionService,
} from "@/lib/market-session";

export class ContextEngine {
  static current(): MarketContext {
    const session =
      MarketSessionService.current();

    return {
      session: session.current,

      isMarketOpen:
        session.isOpen,

      overlap:
        session.overlap,

      marketPhase:
        session.isOpen
          ? "active"
          : "closed",

      summary:
        session.description,
    };
  }
}