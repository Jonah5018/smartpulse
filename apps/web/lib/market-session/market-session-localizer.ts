import {
  MarketSessionUtils,
} from "./market-session-utils";

import type {
  LocalizedSessionStatus,
  SessionStatus,
} from "./market-session-types";

export class MarketSessionLocalizer {
  static localize(
    status: SessionStatus,
    userTimezone: string,
    date = new Date()
  ): LocalizedSessionStatus {
    const sessionTimezone =
      MarketSessionUtils.timezoneForSession(
        status.current
      ) ?? "UTC";

    return {
      ...status,

      sessionTimezone,

      userTimezone,

      localTime:
        MarketSessionUtils.formatInTimezone(
          date,
          userTimezone
        ),

      nextSessionStartsAtLocal:
        status.nextSessionStartsAt
          ? MarketSessionUtils.formatInTimezone(
              new Date(
                status.nextSessionStartsAt
              ),
              userTimezone
            )
          : null,
    };
  }
}