// lib/macro/macro-context-builder.ts

import type {
  MacroAnalysisResult,
  MacroBias,
} from "./macro-types";

export interface MacroContext {
  headline: string;

  summary: string;

  institutionalNarrative: string;

  primaryDriver: string | null;

  riskLevel: "low" | "moderate" | "high";

  bias: MacroBias;

  confidence: number;
}

export class MacroContextBuilder {
  static build(
    analysis: MacroAnalysisResult
  ): MacroContext {
    const primary =
      analysis.insights[0] ?? null;

    return {
      headline:
        analysis.confidence === 0 ? "Macro direction unavailable" : this.headline(analysis.overallBias),

      summary:
        this.summary(analysis),

      institutionalNarrative:
        this.narrative(analysis),

      primaryDriver:
        primary?.event ?? null,

      riskLevel:
        this.risk(analysis),

      bias:
        analysis.overallBias,

      confidence:
        analysis.confidence,
    };
  }

  private static headline(
    bias: MacroBias
  ): string {
    switch (bias) {
      case "bullish":
        return "Risk sentiment is improving";

      case "bearish":
        return "Defensive macro conditions detected";

      default:
        return "Balanced macro environment";
    }
  }

  private static summary(
    analysis: MacroAnalysisResult
  ): string {
    if (analysis.confidence === 0) {
      return "Available calendar information is insufficient to establish a directional macro outlook.";
    }
    const confidence =
      Math.round(
        analysis.confidence * 100
      );

    switch (analysis.overallBias) {
      case "bullish":
        return `Institutional macro conditions currently favor improving market sentiment with ${confidence}% confidence.`;

      case "bearish":
        return `Institutional macro conditions suggest elevated downside pressure with ${confidence}% confidence.`;

      default:
        return `Economic releases remain mixed, producing a broadly neutral institutional backdrop.`;
    }
  }

  private static narrative(
    analysis: MacroAnalysisResult
  ): string {
    const first =
      analysis.insights[0];

    if (!first) {
      return "No economic release data is available to assess current macroeconomic catalysts.";
    }

    return first.narrative.summary;
  }

  private static risk(
    analysis: MacroAnalysisResult
  ): "low" | "moderate" | "high" {
    const highImpact =
      analysis.insights.filter(
        (item) =>
          item.impact === "high"
      ).length;

    if (highImpact >= 2) return "high";
    if (highImpact === 1)
      return "moderate";

    return "low";
  }
}
