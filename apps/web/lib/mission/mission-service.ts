import { MissionEngine } from "./mission-engine";

export class MissionService {
  static current(
    symbol: string
  ) {
    return MissionEngine.current(
      symbol
    );
  }
}