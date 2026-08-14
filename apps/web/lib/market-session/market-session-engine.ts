import type {
  SessionStatus,
  TradingSession,
} from "./market-session-types";

import {
  MarketSessionUtils,
} from "./market-session-utils";

export class MarketSessionEngine {
  /**
   * Determine the currently active forex session.
   *
   * Session hours are evaluated in each market's
   * own IANA timezone, rather than using fixed UTC
   * offsets.
   */
  static current(
    date = new Date()
  ): SessionStatus {
    if (
      MarketSessionUtils.isWeekend(
        date
      )
    ) {
      return {
        current: "closed",
        isOpen: false,
        description:
          "Forex market is closed for the weekend.",
        nextSession: "sydney",
        nextSessionStartsAt:
          MarketSessionUtils.nextSessionStart(
            "sydney",
            date
          ),
        overlap: "none",
      };
    }

    const active =
      this.activeSessions(date);

    if (
      active.includes("new_york")
    ) {
      return {
        current: "new_york",
        isOpen: true,
        description:
          active.includes("london")
            ? "New York session during the London/New York overlap."
            : "New York trading session.",
        nextSession: "sydney",
        nextSessionStartsAt:
          MarketSessionUtils.nextSessionStart(
            "sydney",
            date
          ),
        overlap:
          active.includes("london")
            ? "london_new_york"
            : "none",
      };
    }

    if (
      active.includes("london")
    ) {
      return {
        current: "london",
        isOpen: true,
        description:
          active.includes("tokyo")
            ? "London session during the Tokyo/London transition."
            : "London trading session.",
        nextSession: "new_york",
        nextSessionStartsAt:
          MarketSessionUtils.nextSessionStart(
            "new_york",
            date
          ),
        overlap:
          active.includes("tokyo")
            ? "tokyo_london"
            : "none",
      };
    }

    if (
      active.includes("tokyo")
    ) {
      return {
        current: "tokyo",
        isOpen: true,
        description:
          active.includes("sydney")
            ? "Tokyo session during the Sydney/Tokyo overlap."
            : "Tokyo trading session.",
        nextSession: "london",
        nextSessionStartsAt:
          MarketSessionUtils.nextSessionStart(
            "london",
            date
          ),
        overlap:
          active.includes("sydney")
            ? "sydney_tokyo"
            : "none",
      };
    }

    if (
      active.includes("sydney")
    ) {
      return {
        current: "sydney",
        isOpen: true,
        description:
          "Sydney trading session.",
        nextSession: "tokyo",
        nextSessionStartsAt:
          MarketSessionUtils.nextSessionStart(
            "tokyo",
            date
          ),
        overlap: "none",
      };
    }

    return {
      current: "closed",
      isOpen: false,
      description:
        "No major forex session is currently active.",
      nextSession: "sydney",
      nextSessionStartsAt:
        MarketSessionUtils.nextSessionStart(
          "sydney",
          date
        ),
      overlap: "none",
    };
  }

  private static activeSessions(
    date: Date
  ): TradingSession[] {
    const sessions:
      TradingSession[] = [];

    /*
     * Sydney:
     * 08:00 - 17:00 local.
     */
    const sydneyHour =
      MarketSessionUtils.localHour(
        "sydney",
        date
      );

    if (
      sydneyHour !== null &&
      sydneyHour >= 8 &&
      sydneyHour < 17
    ) {
      sessions.push("sydney");
    }

    /*
     * Tokyo:
     * 09:00 - 18:00 local.
     */
    const tokyoHour =
      MarketSessionUtils.localHour(
        "tokyo",
        date
      );

    if (
      tokyoHour !== null &&
      tokyoHour >= 9 &&
      tokyoHour < 18
    ) {
      sessions.push("tokyo");
    }

    /*
     * London:
     * 08:00 - 17:00 local.
     */
    const londonHour =
      MarketSessionUtils.localHour(
        "london",
        date
      );

    if (
      londonHour !== null &&
      londonHour >= 8 &&
      londonHour < 17
    ) {
      sessions.push("london");
    }

    /*
     * New York:
     * 08:00 - 17:00 local.
     */
    const newYorkHour =
      MarketSessionUtils.localHour(
        "new_york",
        date
      );

    if (
      newYorkHour !== null &&
      newYorkHour >= 8 &&
      newYorkHour < 17
    ) {
      sessions.push("new_york");
    }

    return sessions;
  }
}