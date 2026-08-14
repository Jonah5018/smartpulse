import type {
  DecisionState,
} from "./decision-types";

export class DecisionStateMachine {
  static next(
    state: DecisionState
  ): DecisionState {
    switch (state) {
      case "discovered":
        return "forming";

      case "forming":
        return "ready";

      case "ready":
        return "confirmed";

      case "confirmed":
        return "active";

      case "active":
        return "completed";

      default:
        return state;
    }
  }
}