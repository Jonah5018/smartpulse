import {
  EconomicCalendarProvider,
} from "./economic-calendar-provider";

export class EconomicCalendarService {
  static today() {
    return EconomicCalendarProvider.today();
  }

  static upcoming(
    days = 30
  ) {
    return EconomicCalendarProvider.upcoming(
      days
    );
  }
}