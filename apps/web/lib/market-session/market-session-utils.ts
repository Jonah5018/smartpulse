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

  static isWeekend(
    date = new Date()
  ): boolean {
    const day =
      this.utcDay(date);

    return (
      day === 0 ||
      day === 6
    );
  }

  /**
   * IANA timezone used by each major forex session.
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
   * Returns the local hour for a market session.
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
          timeZone: timezone,
          hour: "numeric",
          hour12: false,
        }
      ).formatToParts(date);

    const hour =
      parts.find(
        (part) =>
          part.type === "hour"
      )?.value;

    if (!hour) {
      return null;
    }

    return Number(hour);
  }

  /**
   * Returns a formatted timestamp in an
   * IANA timezone.
   */
  static formatInTimezone(
    date: Date,
    timezone: string
  ): string {
    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone,
      }
    ).format(date);
  }

  /**
   * Returns the UTC timestamp corresponding
   * to the next session opening.
   *
   * Session opening times are defined in the
   * session's own local timezone, allowing
   * DST-aware conversion.
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
      startHour === null
    ) {
      return null;
    }

    /*
     * Search forward minute-by-minute for
     * the next occurrence of the session's
     * local opening time.
     *
     * This is intentionally limited to a
     * small search window and is only used
     * for presentation/countdown purposes.
     */
    const candidate =
      new Date(date);

    candidate.setUTCSeconds(0);
    candidate.setUTCMilliseconds(0);

    for (
      let i = 0;
      i <= 60 * 48;
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
        localMinute === 0 &&
        candidate.getTime() >
          date.getTime()
      ) {
        return candidate.toISOString();
      }

      candidate.setUTCMinutes(
        candidate.getUTCMinutes() + 1
      );
    }

    return null;
  }

  private static localMinute(
    session: TradingSession,
    date: Date
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
          timeZone: timezone,
          minute: "numeric",
        }
      ).formatToParts(date);

    const minute =
      parts.find(
        (part) =>
          part.type ===
          "minute"
      )?.value;

    return minute
      ? Number(minute)
      : null;
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