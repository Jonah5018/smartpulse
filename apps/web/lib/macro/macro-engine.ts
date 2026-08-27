// lib/macro/macro-engine.ts

import {
  MacroAnalysisResult,
  MacroBias,
  MacroEvent,
  MacroInsight,
} from "./macro-types";

export class MacroEngine {
  static analyze(events: MacroEvent[]): MacroAnalysisResult {
    const insights: MacroInsight[] = events.map((event) => {
      const bias = this.resolveBias(event);

      return {
        currency: event.currency,
        event: event.name,
        impact: event.impact,
        bias,
        confidence: this.calculateConfidence(event),
        narrative: this.buildNarrative(event, bias),
      };
    });

    const overallBias = this.resolveOverallBias(insights);

    const confidence =
      insights.length === 0
        ? 0
        : Number(
            (
              insights.reduce((sum, item) => sum + item.confidence, 0) /
              insights.length
            ).toFixed(2)
          );

    return {
      insights,
      overallBias,
      confidence,
      generatedAt: new Date(),
    };
  }

  private static resolveBias(event: MacroEvent): MacroBias {
    if (event.actual === null || event.forecast === null) {
      return "neutral";
    }

    if (event.actual > event.forecast) {
      return "bearish";
    }

    if (event.actual < event.forecast) {
      return "bullish";
    }

    return "neutral";
  }

  private static calculateConfidence(event: MacroEvent): number {
    const impactWeight = {
      low: 0.4,
      medium: 0.65,
      high: 0.9,
    };

    return impactWeight[event.impact];
  }

  private static buildNarrative(
    event: MacroEvent,
    bias: MacroBias
  ): MacroInsight["narrative"] {
    if (bias === "bullish") {
      return {
        headline: `${event.currency} supported by ${event.name}`,
        summary: `The released figure came in below forecast, which may reduce monetary tightening pressure and provide supportive conditions for ${event.currency}.`,
      };
    }

    if (bias === "bearish") {
      return {
        headline: `${event.currency} pressured by ${event.name}`,
        summary: `The released figure exceeded expectations, increasing the probability of tighter monetary policy and creating pressure across ${event.currency} markets.`,
      };
    }

    return {
      headline: `${event.name} matched expectations`,
      summary: `The economic release aligned closely with market expectations, producing a largely neutral macro environment.`,
    };
  }

  private static resolveOverallBias(
    insights: MacroInsight[]
  ): MacroBias {
    const bullish = insights.filter((i) => i.bias === "bullish").length;
    const bearish = insights.filter((i) => i.bias === "bearish").length;

    if (bullish > bearish) return "bullish";
    if (bearish > bullish) return "bearish";

    return "neutral";
  }
}