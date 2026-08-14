import {
  EconomicCalendarRepository,
} from "@/lib/repositories/economic-calendar";

import {
  EconomicCalendarEngine,
} from "./economic-calendar-engine";

export class EconomicCalendarAnalysisService {
  static async risk(
    days = 30
  ) {
    const events =
      await EconomicCalendarRepository.getUpcoming(
        days
      );

    return EconomicCalendarEngine.assessRisk(
      events
    );
  }
}