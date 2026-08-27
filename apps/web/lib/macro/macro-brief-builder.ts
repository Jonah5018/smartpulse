// lib/macro/macro-brief-builder.ts

import { MacroAnalysisResult } from "./macro-types";

export interface MacroBrief {
  headline: string;
  summary: string;
  topDrivers: string[];
  riskLevel: "low" | "moderate" | "high";
}

export class MacroBriefBuilder {
  build(analysis: MacroAnalysisResult): MacroBrief {
    const strongest = analysis.insights
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    const topDrivers = strongest.map(
      (item) =>
        `${item.currency} • ${item.event} (${item.bias.toUpperCase()})`
    );

    const headline = this.buildHeadline(analysis);

    const summary = this.buildSummary(analysis);

    const riskLevel = this.resolveRisk(analysis);

    return {
      headline,
      summary,
      topDrivers,
      riskLevel,
    };
  }

  private buildHeadline(analysis: MacroAnalysisResult): string {
    switch (analysis.overallBias) {
      case "bullish":
        return "Macro environment currently favors risk-on positioning";

      case "bearish":
        return "High-impact macro releases are creating defensive market conditions";

      default:
        return "The macro landscape is broadly neutral ahead of major confirmation";
    }
  }

  private buildSummary(analysis: MacroAnalysisResult): string {
    const confidence = Math.round(analysis.confidence * 100);

    switch (analysis.overallBias) {
      case "bullish":
        return `Institutional macro analysis suggests improving economic sentiment with approximately ${confidence}% confidence. Markets may become more supportive if technical structure confirms the move.`;

      case "bearish":
        return `Institutional macro analysis indicates elevated downside pressure with approximately ${confidence}% confidence. Higher-impact releases may increase volatility across major currency pairs.`;

      default:
        return `Current economic releases remain mixed, producing a balanced macro backdrop. SmartPulse recommends waiting for stronger institutional confirmation before increasing conviction.`;
    }
  }

  private resolveRisk(
    analysis: MacroAnalysisResult
  ): "low" | "moderate" | "high" {
    const highImpact = analysis.insights.filter(
      (item) => item.impact === "high"
    ).length;

    if (highImpact >= 2) return "high";
    if (highImpact === 1) return "moderate";

    return "low";
  }
}

export const macroBriefBuilder = new MacroBriefBuilder();