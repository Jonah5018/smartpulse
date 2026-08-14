import { MarketSessionEngine } from "./market-session-engine";

export class MarketSessionService {
  static current() {
    return MarketSessionEngine.current();
  }
}