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
   * own IANA timezone rather than using fixed UTC
   * offsets.
   */
  static current(
    date = new Date()
  ): SessionStatus {
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

    /*
     * Forex market closed.
     *
     * Use deterministic weekend reopening logic
     * instead of the Sydney session utility.
     */
    return {
      current: "closed",

      isOpen: false,

      description:
        "No major forex session is currently active.",

      nextSession: "sydney",

      nextSessionStartsAt:
        this.getNextForexOpen(date).toISOString(),

      overlap: "none",
    };
  }

  /**
   * Forex reopens every Sunday at 23:00
   * Africa/Lagos (22:00 UTC during this period).
   */
  private static getNextForexOpen(
    date: Date
  ): Date {
    const lagos = new Date(
      date.toLocaleString(
        "en-US",
        {
          timeZone:
            "Africa/Lagos",
        }
      )
    );

    const day =
      lagos.getDay();

    const next =
      new Date(lagos);

    if (day === 6) {
      // Saturday → Sunday
      next.setDate(
        next.getDate() + 1
      );
    } else if (day === 0) {
      // Sunday before 23:00
      if (
        next.getHours() >= 23
      ) {
        return next;
      }
    } else {
      // Monday–Friday fallback
      const daysUntilSunday =
        (7 - day) % 7;

      next.setDate(
        next.getDate() +
          daysUntilSunday
      );
    }

    next.setHours(
      23,
      0,
      0,
      0
    );

    return next;
  }

  private static activeSessions(
    date: Date
  ): TradingSession[] {
    const sessions:
      TradingSession[] = [];

    /*
     * Sydney:
     * 08:00 - 17:00 local,
     * Monday-Friday.
     */
    const sydneyHour =
      MarketSessionUtils.localHour(
        "sydney",
        date
      );

    const sydneyWeekday =
      MarketSessionUtils.isWeekdayInTimezone(
        "sydney",
        date
      );

    if (
      sydneyWeekday &&
      sydneyHour !== null &&
      sydneyHour >= 8 &&
      sydneyHour < 17
    ) {
      sessions.push("sydney");
    }

    /*
     * Tokyo:
     * 09:00 - 18:00 local,
     * Monday-Friday.
     */
    const tokyoHour =
      MarketSessionUtils.localHour(
        "tokyo",
        date
      );

    const tokyoWeekday =
      MarketSessionUtils.isWeekdayInTimezone(
        "tokyo",
        date
      );

    if (
      tokyoWeekday &&
      tokyoHour !== null &&
      tokyoHour >= 9 &&
      tokyoHour < 18
    ) {
      sessions.push("tokyo");
    }

    /*
     * London:
     * 08:00 - 17:00 local,
     * Monday-Friday.
     */
    const londonHour =
      MarketSessionUtils.localHour(
        "london",
        date
      );

    const londonWeekday =
      MarketSessionUtils.isWeekdayInTimezone(
        "london",
        date
      );

    if (
      londonWeekday &&
      londonHour !== null &&
      londonHour >= 8 &&
      londonHour < 17
    ) {
      sessions.push("london");
    }

    /*
     * New York:
     * 08:00 - 17:00 local,
     * Monday-Friday.
     */
    const newYorkHour =
      MarketSessionUtils.localHour(
        "new_york",
        date
      );

    const newYorkWeekday =
      MarketSessionUtils.isWeekdayInTimezone(
        "new_york",
        date
      );

    if (
      newYorkWeekday &&
      newYorkHour !== null &&
      newYorkHour >= 8 &&
      newYorkHour < 17
    ) {
      sessions.push("new_york");
    }

    return sessions;
  }
}