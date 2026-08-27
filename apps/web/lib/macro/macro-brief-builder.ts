import type {
  MacroAnalysisResult,
  MacroInsight,
} from "./macro-types";

export interface MacroBrief {
  headline: string;
  summary: string;
  topInsights: MacroInsight[];
}

export class MacroBriefBuilder {
  static build(
    analysis?: MacroAnalysisResult | null
  ): MacroBrief {
    // Gracefully handle unavailable macro analysis
    if (!analysis) {
      return {
        headline: "Macro Intelligence Unavailable",
        summary:
          "Macro analysis is temporarily unavailable. SmartPulse will continue using institutional structure and liquidity until macro data is restored.",
        topInsights: [],
      };
    }

    const strongest = analysis.insights
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    const headline =
      strongest[0]?.narrative.headline ??
      "Neutral Macro Environment";

    const summary =
      strongest.length > 0
        ? strongest
            .map((item) => item.narrative.summary)
            .join(" ")
        : "No significant macro events are currently influencing the market.";

    return {
      headline,
      summary,
      topInsights: strongest,
    };
  }
}