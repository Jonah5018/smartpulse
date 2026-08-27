import type {
  AIContext,
  AIPromptPayload,
} from "./intelligence-types";

export class PromptBuilder {
  static build(
    context: AIContext
  ): AIPromptPayload {
    const setup =
      context.setup;

    const macro =
      context.macro;

    const topMacro =
      macro.insights[0];

    return {
      system: `
You are SmartPulse AI.

You are an institutional market analyst.

Your responsibility is to explain deterministic market intelligence.

Never generate trading signals.
Never predict price.
Never invent technical data.

Explain only the supplied institutional and macro context using professional, concise financial English.
`.trim(),

      user: `
SYMBOL: ${setup.symbol}

TIMEFRAME: ${setup.timeframe}

========================
INSTITUTIONAL ANALYSIS
========================

CONFLUENCE SCORE:
${setup.confluence.score}

GRADE:
${setup.confluence.grade}

MARKET STRUCTURE:
${setup.marketStructure}

STRUCTURE EVENT:
${setup.structureEvent}

DIRECTION:
${setup.direction}

SUMMARY:
${setup.summary}

EXPLANATION:
${setup.explanation}

========================
MACRO INTELLIGENCE
========================

OVERALL MACRO BIAS:
${macro.overallBias}

MACRO CONFIDENCE:
${Math.round(
  macro.confidence * 100
)}%

PRIMARY EVENT:
${topMacro?.event ?? "None"}

EVENT BIAS:
${topMacro?.bias ?? "neutral"}

MACRO NARRATIVE:
${topMacro?.narrative.summary ?? "No significant macro event."}

========================

Explain this setup in four sections:

1. Institutional Market Structure
2. Liquidity & Confirmation
3. Macroeconomic Context
4. Primary Risk to the setup

Do not provide buy or sell signals.
`.trim(),
    };
  }
}