import type {
  EconomicEvent,
} from "./economic-calendar-types";

interface FinCalTodayResponse {
  calendars: Array<{
    date: string;
    calendar: string;
    status: string;
    is_holiday: boolean;
    is_weekend: boolean;
    is_early_close: boolean;
    close_time: string | null;
  }>;
}

interface FinCalUpcomingResponse {
  events: Array<{
    date: string;
    calendar: string;
    event_type:
      | "holiday"
      | "early_close";
    close_time: string | null;
  }>;
}

export class EconomicCalendarProvider {
  private static readonly BASE_URL =
    "https://fincalapi.com/v1";

  private static getApiKey(): string {
    const apiKey =
      process.env.FINCAL_API_KEY;

    if (!apiKey) {
      throw new Error(
        "FINCAL_API_KEY is missing."
      );
    }

    return apiKey;
  }

  static async today(): Promise<
    EconomicEvent[]
  > {
    const response =
      await fetch(
        `${this.BASE_URL}/today`,
        {
          headers: {
            Authorization:
              `Bearer ${this.getApiKey()}`,
          },

          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        }
      );

    if (!response.ok) {
      throw new Error(
        `FinCal API error: ${response.status}`
      );
    }

    const data =
      (await response.json()) as FinCalTodayResponse;

    return data.calendars.map(
      (calendar) => ({
        date:
          calendar.date,

        calendar:
          calendar.calendar,

        status:
          calendar.status,

        isHoliday:
          calendar.is_holiday,

        isWeekend:
          calendar.is_weekend,

        isEarlyClose:
          calendar.is_early_close,

        closeTime:
          calendar.close_time,

        eventType:
          calendar.is_holiday
            ? "holiday"
            : calendar.is_early_close
              ? "early_close"
              : undefined,

        impact:
          calendar.is_holiday ||
          calendar.is_early_close
            ? "medium"
            : "low",

        source:
          "FinCal API",
      })
    );
  }

  static async upcoming(
    days = 30
  ): Promise<EconomicEvent[]> {
    const safeDays =
      Math.min(
        Math.max(
          days,
          1
        ),
        365
      );

    const response =
      await fetch(
        `${this.BASE_URL}/upcoming?days=${safeDays}`,
        {
          headers: {
            Authorization:
              `Bearer ${this.getApiKey()}`,
          },

          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        }
      );

    if (!response.ok) {
      throw new Error(
        `FinCal API error: ${response.status}`
      );
    }

    const data =
      (await response.json()) as FinCalUpcomingResponse;

    return data.events.map(
      (event) => ({
        date:
          event.date,

        calendar:
          event.calendar,

        status:
          event.event_type,

        isHoliday:
          event.event_type ===
          "holiday",

        isWeekend:
          false,

        isEarlyClose:
          event.event_type ===
          "early_close",

        closeTime:
          event.close_time,

        eventType:
          event.event_type,

        impact:
          event.event_type ===
          "holiday"
            ? "medium"
            : "high",

        source:
          "FinCal API",
      })
    );
  }
}
