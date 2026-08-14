import type {
  EconomicEvent,
  EconomicCalendarRisk,
} from "@/lib/providers/economic-calendar";

export class EconomicCalendarEngine {
  static assessRisk(
    events: EconomicEvent[],
    now = new Date()
  ): EconomicCalendarRisk {
    const upcoming =
      events
        .filter(
          (event) =>
            !event.isWeekend &&
            event.eventType !==
              undefined
        )
        .map(
          (event) => ({
            event,

            date:
              new Date(
                event.date
              ),
          })
        )
        .filter(
          ({ date }) =>
            date.getTime() >=
            now.getTime()
        )
        .sort(
          (a, b) =>
            a.date.getTime() -
            b.date.getTime()
        );

    const next =
      upcoming[0];

    if (!next) {
      return {
        hasRisk: false,

        impact: "low",

        event: null,

        message:
          "No upcoming market-calendar risk is currently identified.",

        daysUntil: null,
      };
    }

    const millisecondsUntil =
      next.date.getTime() -
      now.getTime();

    const daysUntil =
      Math.max(
        0,
        Math.ceil(
          millisecondsUntil /
            (1000 * 60 * 60 * 24)
        )
      );

    const impact =
      next.event.impact ??
      "low";

    return {
      hasRisk: true,

      impact,

      event:
        next.event,

      message:
        this.buildMessage(
          next.event,
          daysUntil
        ),

      daysUntil,
    };
  }

  private static buildMessage(
    event: EconomicEvent,
    daysUntil: number
  ): string {
    const calendar =
      event.calendar;

    if (
      event.isEarlyClose
    ) {
      return (
        `${calendar} has an early close in ${daysUntil} day${daysUntil === 1 ? "" : "s"}. Trading conditions may become less liquid as the session approaches the close.`
      );
    }

    if (
      event.isHoliday
    ) {
      return (
        `${calendar} is closed for a holiday in ${daysUntil} day${daysUntil === 1 ? "" : "s"}.`
      );
    }

    return (
      `${calendar} has an upcoming calendar event in ${daysUntil} day${daysUntil === 1 ? "" : "s"}.`
    );
  }
}