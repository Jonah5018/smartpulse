import type {
  TradingSession,
} from "./market-session-types";

export class MarketSessionUtils {
  static utcHour(
    date = new Date()
  ): number {
    return date.getUTCHours();
  }

  static utcDay(
    date = new Date()
  ): number {
    return date.getUTCDay();
  }

  /**
   * Determine whether the global forex market
   * is currently closed for the weekend.
   *
   * Forex does NOT remain closed for the
   * entire UTC Sunday.
   *
   * The trading week begins Sunday evening
   * in New York and ends Friday evening
   * in New York.
   *
   * Using New York time here is intentional
   * because the global FX trading week is
   * conventionally defined around the
   * New York market.
   *
   * The calculation is DST-aware because
   * America/New_York is an IANA timezone.
   */
  static isWeekend(
    date = new Date()
  ): boolean {
    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            "America/New_York",

          weekday:
            "short",

          hour:
            "numeric",

          minute:
            "numeric",

          second:
            "numeric",

          hourCycle:
            "h23",
        }
      ).formatToParts(date);

    const weekday =
      parts.find(
        (part) =>
          part.type ===
          "weekday"
      )?.value;

    const hour =
      Number(
        parts.find(
          (part) =>
            part.type ===
            "hour"
        )?.value ?? 0
      );

    const minute =
      Number(
        parts.find(
          (part) =>
            part.type ===
            "minute"
        )?.value ?? 0
      );

    const second =
      Number(
        parts.find(
          (part) =>
            part.type ===
            "second"
        )?.value ?? 0
      );

    /*
     * Saturday:
     *
     * The forex market is closed for the
     * entire Saturday in New York time.
     */
    if (
      weekday ===
      "Sat"
    ) {
      return true;
    }

    /*
     * Sunday:
     *
     * Forex opens Sunday evening.
     *
     * Before the Sunday opening time,
     * the market remains closed.
     *
     * We use 17:00 New York as the
     * session boundary.
     */
    if (
      weekday ===
      "Sun"
    ) {
      return (
        hour < 17
      );
    }

    /*
     * Friday:
     *
     * Forex remains open through the
     * New York trading day and closes
     * around 17:00 New York time.
     */
    if (
      weekday ===
      "Fri"
    ) {
      return (
        hour > 17 ||
        (
          hour === 17 &&
          (
            minute > 0 ||
            second > 0
          )
        )
      );
    }

    /*
     * Monday - Thursday.
     */
    return false;
  }

  /**
   * IANA timezone used by each major
   * forex session.
   */
  static timezoneForSession(
    session: TradingSession
  ): string | null {
    switch (session) {
      case "sydney":
        return "Australia/Sydney";

      case "tokyo":
        return "Asia/Tokyo";

      case "london":
        return "Europe/London";

      case "new_york":
        return "America/New_York";

      case "closed":
        return null;

      default:
        return null;
    }
  }

  /**
   * Returns the local hour for a market
   * session.
   *
   * hourCycle: "h23" guarantees that
   * midnight is represented as 00 rather
   * than 24.
   */
  static localHour(
    session: TradingSession,
    date = new Date()
  ): number | null {
    const timezone =
      this.timezoneForSession(
        session
      );

    if (!timezone) {
      return null;
    }

    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            timezone,

          hour:
            "numeric",

          hour12:
            false,

          hourCycle:
            "h23",
        }
      ).formatToParts(date);

    const hour =
      parts.find(
        (part) =>
          part.type ===
          "hour"
      )?.value;

    if (
      hour ===
      undefined
    ) {
      return null;
    }

    return Number(
      hour
    );
  }

  /**
   * Determine whether the session's local
   * calendar day is Monday-Friday.
   *
   * This is important because UTC day and
   * the session's local day can differ around
   * the weekly market opening.
   *
   * Example:
   *
   * Sunday evening in Nigeria can already be
   * Monday morning in Sydney.
   */
  static isWeekdayInTimezone(
    session: TradingSession,
    date = new Date()
  ): boolean {
    const timezone =
      this.timezoneForSession(
        session
      );

    if (!timezone) {
      return false;
    }

    const weekday =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            timezone,

          weekday:
            "short",
        }
      ).format(date);

    return (
      weekday !== "Sat" &&
      weekday !== "Sun"
    );
  }

  /**
   * Returns the local minute for a
   * market session.
   */
  static localMinute(
    session: TradingSession,
    date = new Date()
  ): number | null {
    const timezone =
      this.timezoneForSession(
        session
      );

    if (!timezone) {
      return null;
    }

    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            timezone,

          minute:
            "numeric",
        }
      ).formatToParts(date);

    const minute =
      parts.find(
        (part) =>
          part.type ===
          "minute"
      )?.value;

    if (
      minute ===
      undefined
    ) {
      return null;
    }

    return Number(
      minute
    );
  }

  /**
   * Returns a formatted timestamp in
   * an IANA timezone.
   */
  static formatInTimezone(
    date: Date,
    timezone: string
  ): string {
    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",

        timeZone:
          timezone,
      }
    ).format(date);
  }

  /**
   * Returns the UTC timestamp corresponding
   * to the next session opening.
   *
   * Session opening times are evaluated in
   * the session's own IANA timezone so that
   * daylight-saving changes are handled
   * automatically.
   *
   * We search forward for up to seven days
   * because the next session can occur after
   * a weekend.
   */
  static nextSessionStart(
    session: TradingSession,
    date = new Date()
  ): string | null {
    const timezone =
      this.timezoneForSession(
        session
      );

    if (!timezone) {
      return null;
    }

    const startHour =
      this.sessionStartHour(
        session
      );

    if (
      startHour ===
      null
    ) {
      return null;
    }

    /*
     * Normalize the candidate to the
     * beginning of a minute.
     */
    const candidate =
      new Date(date);

    candidate.setUTCSeconds(
      0
    );

    candidate.setUTCMilliseconds(
      0
    );

    /*
     * Search forward for seven days.
     *
     * This is deliberately simple and
     * reliable. This function is used for
     * session-status presentation rather
     * than high-frequency trading logic.
     */
    const maxMinutes =
      60 * 24 * 7;

    for (
      let i = 0;
      i <= maxMinutes;
      i++
    ) {
      const localHour =
        this.localHour(
          session,
          candidate
        );

      const localMinute =
        this.localMinute(
          session,
          candidate
        );

      if (
        localHour ===
          startHour &&
        localMinute ===
          0 &&
        candidate.getTime() >
          date.getTime()
      ) {
        return candidate.toISOString();
      }

      candidate.setUTCMinutes(
        candidate.getUTCMinutes() +
          1
      );
    }

    return null;
  }

  private static sessionStartHour(
    session: TradingSession
  ): number | null {
    switch (session) {
      case "sydney":
        return 8;

      case "tokyo":
        return 9;

      case "london":
        return 8;

      case "new_york":
        return 8;

      case "closed":
        return null;

      default:
        return null;
    }
  }
}