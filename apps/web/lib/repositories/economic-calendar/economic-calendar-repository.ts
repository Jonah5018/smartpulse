import {
  EconomicCalendarProvider,
} from "@/lib/providers/economic-calendar";

import type {
  EconomicEvent,
} from "@/lib/providers/economic-calendar";

export class EconomicCalendarRepository {
  private static todayCache:
    EconomicEvent[] | null =
    null;

  private static todayCacheExpiresAt =
    0;

  private static upcomingCache:
    EconomicEvent[] | null =
    null;

  private static upcomingCacheExpiresAt =
    0;

  private static readonly CACHE_DURATION =
    15 * 60 * 1000;

  static async getToday(): Promise<
    EconomicEvent[]
  > {
    const now =
      Date.now();

    if (
      this.todayCache &&
      now <
        this.todayCacheExpiresAt
    ) {
      return this.todayCache;
    }

    const events =
      await EconomicCalendarProvider.today();

    this.todayCache =
      events;

    this.todayCacheExpiresAt =
      now +
      this.CACHE_DURATION;

    return events;
  }

  static async getUpcoming(
    days = 30
  ): Promise<EconomicEvent[]> {
    const now =
      Date.now();

    if (
      this.upcomingCache &&
      now <
        this.upcomingCacheExpiresAt
    ) {
      return this.upcomingCache;
    }

    const events =
      await EconomicCalendarProvider.upcoming(
        days
      );

    this.upcomingCache =
      events;

    this.upcomingCacheExpiresAt =
      now +
      this.CACHE_DURATION;

    return events;
  }

  static clearCache() {
    this.todayCache =
      null;

    this.todayCacheExpiresAt =
      0;

    this.upcomingCache =
      null;

    this.upcomingCacheExpiresAt =
      0;
  }
}