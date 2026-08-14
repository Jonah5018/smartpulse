export class MarketStatusService {
  static getCurrentUtcDate() {
    return new Date();
  }

  static getCurrentUtcHour() {
    return this.getCurrentUtcDate().getUTCHours();
  }

  static getCurrentWeekday() {
    return this.getCurrentUtcDate().getUTCDay();
  }

  static isTradingDay(days: number[]) {
    return days.includes(this.getCurrentWeekday());
  }

  static getActiveSession() {
    const hour = this.getCurrentUtcHour();

    if (hour >= 22 || hour < 7) {
      return "Sydney";
    }

    if (hour >= 0 && hour < 9) {
      return "Tokyo";
    }

    if (hour >= 7 && hour < 16) {
      return "London";
    }

    if (hour >= 13 && hour < 22) {
      return "New York";
    }

    return null;
  }
}