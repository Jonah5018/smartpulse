import { MissionEngine } from "./mission-engine";

export class MissionService {
  static current() {
    return MissionEngine.current();
  }
}