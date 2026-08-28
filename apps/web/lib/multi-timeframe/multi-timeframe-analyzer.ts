import {
  MarketStructureService,
} from "@/lib/market-structure";

import type {
  MultiTimeframeAnalysis,
} from "./multi-timeframe-types";

type TraderAnalysisProfile = {
  timeframes: {
    context: Parameters<typeof MarketStructureService.current>[1];
    structure: Parameters<typeof MarketStructureService.current>[1];
    execution: Parameters<typeof MarketStructureService.current>[1];
  };
};

type AnalysisTimeframe = "5min" | "15min" | "1h" | "4h";

type TimeframeMarketState = {
  timeframe: AnalysisTimeframe;
  trend: "bullish" | "bearish" | "range";
  bias: "continuation" | "retracement" | "reversal" | "neutral";
  lastBOS: number | null;
  lastCHOCH: number | null;
  liquiditySide: "buy_side" | "sell_side" | null;
  structure: Awaited<
    ReturnType<typeof MarketStructureService.current>
  >["structure"];
  structureEvent: Awaited<
    ReturnType<typeof MarketStructureService.current>
  >["latestEvent"];
  confidence: number;
  summary: string;
};

export class MultiTimeframeAnalyzer {
  static async analyze(
    symbol: string,
    profile: TraderAnalysisProfile
  ): Promise<MultiTimeframeAnalysis> {
    const [
      h4Analysis,
      contextAnalysis,
      structureAnalysis,
      executionAnalysis,
   ] = await Promise.all([
      MarketStructureService.current(
        symbol,
        "4h",
        200
    ),

      MarketStructureService.current(
        symbol,
        profile.timeframes.context,
        200
   ),

      MarketStructureService.current(
        symbol,
        profile.timeframes.structure,
        200
   ),

      MarketStructureService.current(
        symbol,
        profile.timeframes.execution,
        200
   ),
]);

    const context =
      this.toTimeframeState(
        profile.timeframes.context,
        contextAnalysis
      );

    const structure =
      this.toTimeframeState(
        profile.timeframes.structure,
        structureAnalysis
      );

    const execution =
      this.toTimeframeState(
        profile.timeframes.execution,
        executionAnalysis
      );

    const h4 =
      this.toTimeframeState(
        "4h",
        h4Analysis
      );

    const directionalBias =
      this.determineDirectionalBias(
        h4.trend,
        context.trend,
        structure.trend,
        execution.trend
      );

    const alignment =
      this.determineAlignment(
        context.trend,
        structure.trend,
        execution.trend,
        directionalBias
      );

    const confidence =
      this.calculateConfidence(
        h4,
        context,
        structure,
        execution,
        alignment
      );

    const summary =
      this.buildSummary(
        h4,
        context,
        structure,
        execution,
        directionalBias,
        alignment
      );

    const explanation =
      this.buildExplanation(
        h4,
        context,
        structure,
        execution,
        directionalBias,
        alignment
      );
    return {
      symbol,

      h4,

      context,

      structure,

      execution,

      directionalBias,

      alignment: alignment as MultiTimeframeAnalysis["alignment"],

      confidence,

      summary,

      explanation,
    };
  }

  private static toTimeframeState(
    timeframe: TraderAnalysisProfile["timeframes"]["context"],
    analysis: Awaited<
      ReturnType<
        typeof MarketStructureService.current
      >
    >
  ): TimeframeMarketState {
    return {
      timeframe:
        timeframe === "1min" || timeframe === "30min"
          ? "15min"
          : timeframe === "2h" || timeframe === "8h" || timeframe === "1day"
            ? "4h"
            : timeframe ?? "1h",

      trend:
        analysis.trend,

      bias:
        analysis.trend === "range"
          ? "neutral"
          : "continuation",

      lastBOS:
        null,

      lastCHOCH:
        null,

      liquiditySide:
        null,

      structure:
        analysis.structure,

      structureEvent:
        analysis.latestEvent,

      confidence:
        analysis.confidence,

      summary:
        analysis.summary,
    };
  }

  private static determineDirectionalBias(
    h4Trend:
      | "bullish"
      | "bearish"
      | "range",
    contextTrend:
      | "bullish"
      | "bearish"
      | "range",

    structureTrend:
      | "bullish"
      | "bearish"
      | "range",

    executionTrend:
      | "bullish"
      | "bearish"
      | "range"
  ):
    | "bullish"
    | "bearish"
    | "neutral" {

    /*
    * H4 external structure has absolute priority.
    */

    if (h4Trend === "bullish") {
      return "bullish";
   }

    if (h4Trend === "bearish") {
      return "bearish";
   }
    /*
     * The execution timeframe is important,
     * but it does not override a clearly
     * contradictory structural timeframe
     * without context.
     *
     * A directional structure on the trader's
     * structure timeframe gets priority.
     */

    if (
      structureTrend ===
      "bullish"
    ) {
      return "bullish";
    }

    if (
      structureTrend ===
      "bearish"
    ) {
      return "bearish";
    }

    /*
     * If the structure timeframe is ranging,
     * the execution timeframe can still provide
     * a valid directional bias.
     *
     * This is exactly the case we want to support:
     *
     * 4H range
     * 15M bullish
     * 5M bullish
     */
    if (
      structureTrend ===
        "range" &&
      executionTrend ===
        "bullish"
    ) {
      return "bullish";
    }

    if (
      structureTrend ===
        "range" &&
      executionTrend ===
        "bearish"
    ) {
      return "bearish";
    }

    /*
     * A directional context can still provide
     * useful bias even when the lower timeframe
     * is temporarily ranging.
     */
    if (
      contextTrend ===
      "bullish"
    ) {
      return "bullish";
    }

    if (
      contextTrend ===
      "bearish"
    ) {
      return "bearish";
    }

    return "neutral";
  }

  private static determineAlignment(
    contextTrend:
      | "bullish"
      | "bearish"
      | "range",

    structureTrend:
      | "bullish"
      | "bearish"
      | "range",

    executionTrend:
      | "bullish"
      | "bearish"
      | "range",

    directionalBias:
      | "bullish"
      | "bearish"
      | "neutral"
  ):
    | "aligned"
    | "partially_aligned"
    | "countertrend"
    | "range_context" {
    if (
      directionalBias ===
      "neutral"
    ) {
      return "range_context";
    }

    const expectedTrend =
      directionalBias;

    const contextAligned =
      contextTrend ===
        expectedTrend ||
      contextTrend ===
        "range";

    const structureAligned =
      structureTrend ===
        expectedTrend ||
      structureTrend ===
        "range";

    const executionAligned =
      executionTrend ===
        expectedTrend ||
      executionTrend ===
        "range";

    /*
     * If the execution timeframe is moving
     * directly against the intended bias,
     * mark it countertrend rather than
     * pretending everything is aligned.
     */
    if (
      executionTrend !==
        "range" &&
      executionTrend !==
        expectedTrend
    ) {
      return "countertrend";
    }

    if (
      contextAligned &&
      structureAligned &&
      executionAligned
    ) {
      if (
        contextTrend ===
          "range" ||
        structureTrend ===
          "range"
      ) {
        return "partially_aligned";
      }

      return "aligned";
    }

    return "partially_aligned";
  }

  private static calculateConfidence(
    h4: TimeframeMarketState,
    context: TimeframeMarketState,
    structure: TimeframeMarketState,
    execution: TimeframeMarketState,
    alignment:
      | "aligned"
      | "partially_aligned"
      | "countertrend"
      | "range_context"
  ): number {
    /*
     * Structure timeframe carries the greatest
     * weight because it represents the trader's
     * primary directional context.
     */
    let score =
      h4.confidence *
        0.30 +
      context.confidence *
        0.20 +
      structure.confidence *
        0.30 +
      execution.confidence *
        0.20;

    if (
      alignment ===
      "aligned"
    ) {
      score += 10;
    }

    if (
      alignment ===
      "partially_aligned"
    ) {
      score += 3;
    }

    if (
      alignment ===
      "countertrend"
    ) {
      score -= 20;
    }

    /*
     * A ranging context is not automatically
     * penalized. It simply means the lower
     * timeframe setup exists within a broader
     * consolidation environment.
     */
    if (
      alignment ===
      "range_context"
    ) {
      score += 0;
    }

    return Math.round(
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      )
    );
  }

  private static buildSummary(
    h4: TimeframeMarketState,
    context: TimeframeMarketState,
    structure: TimeframeMarketState,
    execution: TimeframeMarketState,
    directionalBias:
      | "bullish"
      | "bearish"
      | "neutral",
    alignment:
      | "aligned"
      | "partially_aligned"
      | "countertrend"
      | "range_context"
  ): string {
    const biasLabel =
      directionalBias ===
      "bullish"
        ? "bullish"
        : "bearish";

    if (
      directionalBias ===
      "neutral"
    ) {
      return (
        `H4 ${h4.trend} institutional structure. ` +
        `${structure.timeframe} confirms ${biasLabel} direction, ` +
        `while ${execution.timeframe} is used for execution alignment.`
     );
    }

    if (
      alignment ===
      "countertrend"
    ) {
      return (
        `${biasLabel} higher-level bias exists, ` +
        `but the execution timeframe is currently moving against it. ` +
        `Wait for alignment before considering an entry.`
      );
    }

    if (
      context.trend ===
        "range" ||
      structure.trend ===
        "range"
    ) {
      return (
        `${biasLabel} setup developing inside a broader range. ` +
        `Use the range boundaries and liquidity as contextual constraints ` +
        `while evaluating the lower-timeframe setup.`
      );
    }

    return (
      `${biasLabel} multi-timeframe structure with ` +
      `${alignment.replace("_", " ")} alignment. ` +
      `Execution conditions should now be evaluated for an ICT/SMC entry.`
    );
  }

  private static buildExplanation(
    h4: TimeframeMarketState,
    context: TimeframeMarketState,
    structure: TimeframeMarketState,
    execution: TimeframeMarketState,
    directionalBias:
      | "bullish"
      | "bearish"
      | "neutral",
    alignment:
      | "aligned"
      | "partially_aligned"
      | "countertrend"
      | "range_context"
  ): string {
    return [
      `H4 INSTITUTIONAL BIAS: ${h4.trend} — ${h4.summary}`,
      `CONTEXT (${context.timeframe}): ${context.trend} — ${context.summary}`,

      `STRUCTURE (${structure.timeframe}): ${structure.trend} / ${structure.structure} — ${structure.summary}`,

      `EXECUTION (${execution.timeframe}): ${execution.trend} / ${execution.structure} — ${execution.summary}`,

      `DIRECTIONAL BIAS: ${directionalBias}.`,

      `MULTI-TIMEFRAME ALIGNMENT: ${alignment}.`,

      this.buildDecision(
        context,
        structure,
        execution,
        directionalBias,
        alignment
      ),
    ].join("\n");
  }

  private static buildDecision(
    context: TimeframeMarketState,
    structure: TimeframeMarketState,
    execution: TimeframeMarketState,
    directionalBias:
      | "bullish"
      | "bearish"
      | "neutral",
    alignment:
      | "aligned"
      | "partially_aligned"
      | "countertrend"
      | "range_context"
  ): string {
    if (
      directionalBias ===
      "neutral"
    ) {
      return (
        "DECISION: No directional edge is established across the configured timeframes. Stand aside until structure develops."
      );
    }

    if (
      alignment ===
      "countertrend"
    ) {
      return (
        "DECISION: Do not chase the current execution move. Wait for the execution timeframe to realign with the configured directional bias."
      );
    }

    if (
      context.trend ===
        "range" ||
      structure.trend ===
        "range"
    ) {
      return (
        "DECISION: A lower-timeframe setup may still be valid. Treat the broader range as context rather than an automatic veto, and pay particular attention to range liquidity boundaries."
      );
    }

    if (
      alignment ===
      "aligned"
    ) {
      return (
        "DECISION: Multi-timeframe structure is aligned. Proceed to liquidity, displacement, FVG, entry-location and R:R validation."
      );
    }

    return (
      "DECISION: Conditions are partially aligned. Require additional ICT/SMC confirmation before considering an entry."
    );
  }
}