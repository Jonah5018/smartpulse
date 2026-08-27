// lib/macro/macro-context-service.ts

import { macroService } from "./macro-service";
import {
  MacroContextBuilder,
  type MacroContext,
} from "./macro-context-builder";

export class MacroContextService {
  async current(): Promise<MacroContext> {
    const analysis =
      await macroService.getTodayAnalysis();

    return MacroContextBuilder.build(
      analysis
    );
  }
}

export const macroContextService =
  new MacroContextService();