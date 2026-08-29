import type {
  ConfluenceResult,
} from "@/lib/institutional/confluence";

import {
  ExecutionReadinessAnalyzer,
} from "./execution-readiness-analyzer";

export class ExecutionReadinessService {
  static evaluate(
    confluence: ConfluenceResult,
    hasEntryZone: boolean,
    hasRiskReward: boolean,
    directionalAlignment: boolean
  ) {
    return ExecutionReadinessAnalyzer.evaluate(
      confluence,
      hasEntryZone,
      hasRiskReward,
      directionalAlignment
    );
  }
}