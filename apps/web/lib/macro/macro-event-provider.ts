// lib/macro/macro-event-provider.ts

import { EconomicCalendarAnalysisService } from "@/lib/economic-calendar";
import type { MacroEvent } from "./macro-types";

export class MacroEventProvider {
  /**
   * Converts the Economic Calendar domain into
   * deterministic Macro Events consumed by the Macro Engine.
   */
  async getTodayEvents(): Promise<MacroEvent[]> {
    const risk =
      await EconomicCalendarAnalysisService.risk(30);

    if (!risk.hasRisk || !risk.event) {
      return [];
    }

    const event = risk.event;

    return [
      {
        id: `${event.calendar}-${event.eventType ?? "event"}-${event.date}`,
        currency: this.resolveCurrency(event.calendar),
        name: this.resolveEventName(event),
        impact: event.impact ?? "low",
        previous: null,
        forecast: null,
        actual: null,
        timestamp: new Date(event.date),
      },
    ];
  }

  private resolveEventName(event: {
    calendar: string;
    eventType?: string;
    isHoliday?: boolean;
    isEarlyClose?: boolean;
  }): string {
    if (event.isHoliday) {
      return `${event.calendar} Holiday`;
    }

    if (event.isEarlyClose) {
      return `${event.calendar} Early Close`;
    }

    return event.eventType
      ? `${event.calendar} ${event.eventType}`
      : `${event.calendar} Calendar Event`;
  }

  private resolveCurrency(calendar: string): MacroEvent["currency"] {
    const normalized = calendar.toUpperCase();

    if (normalized.includes("USD")) return "USD";
    if (normalized.includes("EUR")) return "EUR";
    if (normalized.includes("GBP")) return "GBP";
    if (normalized.includes("JPY")) return "JPY";
    if (normalized.includes("CHF")) return "CHF";
    if (normalized.includes("AUD")) return "AUD";
    if (normalized.includes("NZD")) return "NZD";

    if (normalized.includes("CAD")) return "CAD";
    return "UNKNOWN";
  }
}

export const macroEventProvider = new MacroEventProvider();
