import type {
  ConfluenceResult,
} from "@/lib/institutional/confluence";

import type {
  ExecutionReadiness,
} from "./execution-readiness-types";

export class ExecutionReadinessAnalyzer {
  static evaluate(
    confluence: ConfluenceResult,
    hasEntryZone: boolean,
    hasRiskReward: boolean,
    directionalAlignment: boolean
  ): ExecutionReadiness {
    const confirmations: string[] = [];
    const missing: string[] = [];

    let score = 0;

    if (directionalAlignment) {
      confirmations.push(
        "Higher timeframe alignment confirmed."
      );
      score += 30;
    } else {
      missing.push(
        "Higher timeframe alignment missing."
      );
    }

    if (confluence.valid) {
      confirmations.push(
        "Institutional confluence validated."
      );
      score += 30;
    } else {
      missing.push(
        "Confluence score too low."
      );
    }

    if (hasEntryZone) {
      confirmations.push(
        "Valid Fair Value Gap entry zone."
      );
      score += 20;
    } else {
      missing.push(
        "No executable entry zone."
      );
    }

    if (hasRiskReward) {
      confirmations.push(
        "Risk/Reward meets minimum threshold."
      );
      score += 20;
    } else {
      missing.push(
        "Risk/Reward below minimum."
      );
    }

    const state =
      score >= 90
        ? "ready"
        : score >= 50
        ? "forming"
        : "no_setup";

    return {
      state,
      score,
      confirmations,
      missing,
      explanation:
        state === "ready"
          ? "All major execution conditions are aligned."
          : state === "forming"
          ? "The setup is developing but still requires confirmation."
          : "Current conditions do not justify an institutional entry.",
    };
  }
}