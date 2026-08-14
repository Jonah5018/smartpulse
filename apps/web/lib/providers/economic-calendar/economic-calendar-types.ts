export type EconomicEventType =
  | "holiday"
  | "early_close";

export type EconomicEventImpact =
  | "low"
  | "medium"
  | "high";

export interface EconomicEvent {
  date: string;

  calendar: string;

  status: string;

  isHoliday: boolean;

  isWeekend: boolean;

  isEarlyClose: boolean;

  closeTime: string | null;

  eventType?: EconomicEventType;

  impact?: EconomicEventImpact;

  timezone?: string;

  source?: string;
}

export interface EconomicCalendarRisk {
  hasRisk: boolean;

  impact: EconomicEventImpact;

  event: EconomicEvent | null;

  message: string;

  daysUntil: number | null;
}