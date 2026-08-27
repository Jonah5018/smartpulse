import {
  MarketSessionEngine,
} from "./market-session-engine";

export class MarketSessionService {
  static current(
    date = new Date()
  ) {
    return MarketSessionEngine.current(
      date
    );
  }
}