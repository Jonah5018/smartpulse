import type {
  MarketType,
} from "@/lib/market";

import {
  MARKET_UNIVERSE,
} from "@/lib/market/market-universe";

import {
  MarketSessionService,
} from "./market-session-service";

export type MarketAvailabilityStatus =
  | "open"
  | "closed"
  | "unknown";

export interface MarketAvailability {
  symbol: string;

  type: MarketType | null;

  status: MarketAvailabilityStatus;

  isOpen: boolean;

  reason: string;
}

export class MarketAvailabilityService {
  /**
   * Determine whether a specific instrument is
   * currently eligible for live/deep analysis.
   *
   * Market-data availability and market trading
   * availability are intentionally kept separate.
   */
  static current(
    symbol: string,
    date = new Date()
  ): MarketAvailability {
    const normalizedSymbol =
      symbol
        .trim()
        .toUpperCase();

    const instrument =
      MARKET_UNIVERSE.find(
        (market) =>
          market.symbol.toUpperCase() ===
          normalizedSymbol
      );

    /*
     * Unknown instruments preserve the previous
     * behavior so existing callers are not
     * unexpectedly blocked.
     */
    if (!instrument) {
      return {
        symbol:
          normalizedSymbol,

        type: null,

        status: "unknown",

        isOpen: true,

        reason:
          "Market calendar is not configured for this instrument. Existing analysis behavior is preserved.",
      };
    }

    switch (instrument.type) {
      case "forex":
        return this.forexAvailability(
          normalizedSymbol,
          date
        );

      case "crypto":
        return {
          symbol:
            normalizedSymbol,

          type: "crypto",

          status: "open",

          isOpen: true,

          reason:
            "Crypto markets operate continuously.",
        };

      case "commodity":
        return this.commodityAvailability(
          normalizedSymbol,
          date
        );

      case "index":
        return this.indexAvailability(
          normalizedSymbol,
          date
        );

      default:
        return {
          symbol:
            normalizedSymbol,

          type: instrument.type,

          status: "unknown",

          isOpen: true,

          reason:
            "Market calendar is not configured for this instrument. Existing analysis behavior is preserved.",
        };
    }
  }

  /**
   * Forex availability follows the SmartPulse
   * session calendar.
   */
  private static forexAvailability(
    symbol: string,
    date: Date
  ): MarketAvailability {
    const session =
      MarketSessionService.current(
        date
      );

    if (!session.isOpen) {
      return {
        symbol,

        type: "forex",

        status: "closed",

        isOpen: false,

        reason:
          session.description,
      };
    }

    return {
      symbol,

      type: "forex",

      status: "open",

      isOpen: true,

      reason:
        session.description,
    };
  }

  /**
   * Gold / commodity availability.
   *
   * This is intentionally separate from the
   * forex session calendar.
   *
   * Baseline SmartPulse commodity schedule:
   *
   * Sunday:
   *   Opens at 22:00 UTC.
   *
   * Monday-Friday:
   *   Open.
   *
   * Saturday:
   *   Closed.
   *
   * Friday:
   *   Closes at 21:00 UTC.
   *
   * This is a SmartPulse baseline schedule and
   * can later be replaced with provider-specific
   * exchange/broker hours without changing the
   * application layer.
   */
  private static commodityAvailability(
    symbol: string,
    date: Date
  ): MarketAvailability {
    const day =
      date.getUTCDay();

    const hour =
      date.getUTCHours();

    /*
     * Saturday is closed.
     */
    if (day === 6) {
      return {
        symbol,

        type: "commodity",

        status: "closed",

        isOpen: false,

        reason:
          "Commodity markets are closed for the weekend.",
      };
    }

    /*
     * Sunday remains closed until the
     * baseline 22:00 UTC reopening.
     */
    if (
      day === 0 &&
      hour < 22
    ) {
      return {
        symbol,

        type: "commodity",

        status: "closed",

        isOpen: false,

        reason:
          "Commodity markets reopen Sunday at 22:00 UTC.",
      };
    }

    /*
     * Friday closes at 21:00 UTC.
     */
    if (
      day === 5 &&
      hour >= 21
    ) {
      return {
        symbol,

        type: "commodity",

        status: "closed",

        isOpen: false,

        reason:
          "Commodity markets have closed for the weekend.",
      };
    }

    return {
      symbol,

      type: "commodity",

      status: "open",

      isOpen: true,

      reason:
        "Commodity market is within the active SmartPulse trading window.",
    };
  }

  /**
   * Index availability.
   *
   * Exact exchange hours will be introduced
   * when SmartPulse enables specific indices.
   */
  private static indexAvailability(
    symbol: string,
    date: Date
  ): MarketAvailability {
    const day =
      date.getUTCDay();

    if (
      day === 0 ||
      day === 6
    ) {
      return {
        symbol,

        type: "index",

        status: "closed",

        isOpen: false,

        reason:
          "Index markets are closed for the weekend.",
      };
    }

    return {
      symbol,

      type: "index",

      status: "open",

      isOpen: true,

      reason:
        "Index market is eligible for live analysis.",
    };
  }
}