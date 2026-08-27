// lib/macro/macro-service.ts

import { MacroEngine } from "./macro-engine";
import { macroEventProvider } from "./macro-event-provider";
import type {
  MacroAnalysisResult,
  MacroEvent,
} from "./macro-types";

export class MacroService {
  analyze(
    events: MacroEvent[]
  ): MacroAnalysisResult {
    return MacroEngine.analyze(events);
  }

  async getTodayAnalysis(): Promise<MacroAnalysisResult> {
    const events =
      await macroEventProvider.getTodayEvents();

    return this.analyze(events);
  }
}

export const macroService =
  new MacroService();