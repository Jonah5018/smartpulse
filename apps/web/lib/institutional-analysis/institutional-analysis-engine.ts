import {
  InstitutionalSetupEngine,
} from "@/lib/institutional-setup";

import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import {
  EvidenceBuilder,
} from "@/lib/evidence";

import type {
  InstitutionalAnalysis,
  MarketBias,
  SetupGrade,
} from "./institutional-analysis-types";

export class InstitutionalAnalysisEngine {
  static async analyze(
    symbol: string
  ): Promise<InstitutionalAnalysis> {
    const setup =
      await InstitutionalSetupEngine.current(
        symbol
      );

    const bias =
      this.getBias(
        setup
      );

    const evidence =
      this.buildEvidence(
        setup
      );

    const confidence =
      this.calculateConfidence(
        setup
      );

    const setupGrade =
      this.calculateSetupGrade(
        setup,
        confidence
      );

    const recommendation =
      this.buildRecommendation(
        setup,
        setupGrade
      );

    return {
      symbol,

      bias,

      confidence,

      setupGrade,

      recommendation,

      evidence,
    };
  }

  /**
   * Convert the institutional setup direction
   * into the higher-level analysis bias.
   */
  private static getBias(
    setup: InstitutionalSetup
  ): MarketBias {
    if (
      setup.direction ===
      "buy"
    ) {
      return "bullish";
    }

    if (
      setup.direction ===
      "sell"
    ) {
      return "bearish";
    }

    return "neutral";
  }

  /**
   * Build evidence from actual analytical
   * signals.
   *
   * No evidence here should claim something
   * that the underlying engines did not establish.
   */
  private static buildEvidence(
    setup: InstitutionalSetup
  ) {
    const builder =
      new EvidenceBuilder();

    const directionalBias =
      setup.direction !==
      "neutral";

    builder.add(
      "Directional Bias",
      directionalBias,
      directionalBias
        ? `The configured multi-timeframe analysis currently supports a ${setup.direction === "buy" ? "bullish" : "bearish"} directional bias.`
        : "The configured timeframes do not currently establish a directional bias.",
      5
    );

    const structureConfirmed =
      setup.structureEvent !==
      "none";

    builder.add(
      "Market Structure",
      structureConfirmed,
      structureConfirmed
        ? `The execution timeframe has a confirmed ${setup.structureEvent.toUpperCase()} event within ${setup.executionTimeframe} structure.`
        : `No confirmed BOS, MSS or CHOCH is currently identified on the ${setup.executionTimeframe} execution timeframe.`,
      5
    );

    const mtfAligned =
      setup.multiTimeframeAlignment ===
        "aligned" ||
      setup.multiTimeframeAlignment ===
        "partially_aligned" ||
      setup.multiTimeframeAlignment ===
        "range_context";

    builder.add(
      "Multi-Timeframe Context",
      mtfAligned,
      this.buildMultiTimeframeEvidence(
        setup
      ),
      5
    );

    const liquidityConfirmed =
      setup.liquiditySweep !==
      null;

    builder.add(
      "Liquidity Interaction",
      liquidityConfirmed,
      liquidityConfirmed
        ? `${this.getLiquiditySweepLabel(setup)} was detected during the current analysis.`
        : "No confirmed liquidity sweep is currently available.",
      4
    );

    const displacementConfirmed =
      setup.displacement !==
      null;

    builder.add(
      "Displacement",
      displacementConfirmed,
      displacementConfirmed
        ? `${setup.displacement === "bullish" ? "Bullish" : "Bearish"} displacement is present on the execution analysis.`
        : "No directional displacement is currently confirmed.",
      5
    );

    const fvgConfirmed =
      setup.fairValueGap !==
      null;

    builder.add(
      "Fair Value Gap",
      fvgConfirmed,
      fvgConfirmed
        ? `A potential ${setup.direction === "buy" ? "bullish" : "bearish"} FVG entry area has been identified.`
        : "No suitable active FVG has been identified for the current directional thesis.",
      5
    );

    const invalidationDefined =
      setup.invalidation !==
      null;

    builder.add(
      "Invalidation",
      invalidationDefined,
      invalidationDefined
        ? `A structural invalidation level is defined around ${setup.invalidation}.`
        : "A reliable structural invalidation level has not yet been established.",
      4
    );

    const riskRewardDefined =
      setup.riskReward !==
      null;

    const riskRewardAcceptable =
      (setup.riskReward?.ratio ??
        0) >= 2;

    builder.add(
      "Risk-to-Reward",
      riskRewardDefined &&
        riskRewardAcceptable,
      riskRewardDefined
        ? `Current potential risk-to-reward is ${setup.riskReward?.ratio}:1.`
        : "A complete risk-to-reward calculation is not currently available.",
      5
    );

    const setupReady =
      setup.state ===
      "ready";

    builder.add(
      "Setup Readiness",
      setupReady,
      setupReady
        ? "The current technical filters have been satisfied."
        : "The setup is still forming and one or more confirmation conditions remain incomplete.",
      5
    );

    /*
     * IMPORTANT:
     *
     * A range context is NOT treated as failed
     * evidence.
     *
     * A lower-timeframe setup can legitimately
     * develop inside a broader range.
     */
    const insideRange =
      setup.setupContext ===
      "inside_range";

    if (insideRange) {
      builder.add(
        "Range Context",
        true,
        `The setup is developing inside the broader ${setup.contextTimeframe} range. The range is treated as context rather than an automatic setup veto.`,
        3
      );
    }

    return builder.build();
  }

  private static buildMultiTimeframeEvidence(
    setup: InstitutionalSetup
  ): string {
    if (
      setup.multiTimeframeAlignment ===
      "aligned"
    ) {
      return (
        `${setup.contextTimeframe}, ${setup.structureTimeframe} and ${setup.executionTimeframe} are directionally aligned.`
      );
    }

    if (
      setup.multiTimeframeAlignment ===
      "range_context"
    ) {
      return (
        `The broader ${setup.contextTimeframe} context is ranging, while the lower configured timeframe analysis can still provide directional opportunity.`
      );
    }

    if (
      setup.multiTimeframeAlignment ===
      "partially_aligned"
    ) {
      return (
        `The configured timeframes are partially aligned; additional execution confirmation is required.`
      );
    }

    if (
      setup.multiTimeframeAlignment ===
      "countertrend"
    ) {
      return (
        `The execution timeframe is currently countertrend to the configured directional context.`
      );
    }

    return (
      "The configured timeframes do not currently provide sufficient alignment."
    );
  }

  private static getLiquiditySweepLabel(
    setup: InstitutionalSetup
  ): string {
    if (
      setup.liquiditySweep ===
      "buy_side"
    ) {
      return "Buy-side liquidity sweep";
    }

    if (
      setup.liquiditySweep ===
      "sell_side"
    ) {
      return "Sell-side liquidity sweep";
    }

    return "Liquidity interaction";
  }

  /**
   * Institutional Analysis confidence is derived
   * from the already-calculated setup confidence,
   * then adjusted according to whether the setup
   * has the evidence needed for an actionable
   * institutional thesis.
   */
  private static calculateConfidence(
    setup: InstitutionalSetup
  ): number {
    let score =
      setup.confidence;

    if (
      setup.state ===
      "ready"
    ) {
      score += 5;
    }

    if (
      setup.state ===
      "forming"
    ) {
      score -= 3;
    }

    if (
      setup.multiTimeframeAlignment ===
      "countertrend"
    ) {
      score -= 10;
    }

    if (
      setup.liquiditySweep
    ) {
      score += 3;
    }

    if (
      setup.displacement
    ) {
      score += 4;
    }

    if (
      setup.fairValueGap
    ) {
      score += 3;
    }

    if (
      setup.riskReward &&
      setup.riskReward.ratio >=
        2
    ) {
      score += 5;
    }

    /*
     * A broader range is not penalized.
     */
    if (
      setup.setupContext ===
      "inside_range"
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

  /**
   * Grade the setup based on actual evidence,
   * not confidence alone.
   *
   * A high confidence number without R:R,
   * invalidation or execution confirmation
   * cannot become an A+ setup.
   */
  private static calculateSetupGrade(
    setup: InstitutionalSetup,
    confidence: number
  ): SetupGrade {
    const ratio =
      setup.riskReward?.ratio ??
      0;

    const hasStructure =
      setup.structureEvent !==
      "none";

    const hasLiquidity =
      setup.liquiditySweep !==
      null;

    const hasDisplacement =
      setup.displacement !==
      null;

    const hasFVG =
      setup.fairValueGap !==
      null;

    const hasInvalidation =
      setup.invalidation !==
      null;

    const hasAcceptableRR =
      ratio >= 2;

    const ready =
      setup.state ===
      "ready";

    /*
     * A+
     *
     * Requires the complete chain:
     *
     * directional bias
     * + structure
     * + liquidity
     * + displacement
     * + FVG
     * + invalidation
     * + >= 3R
     * + ready
     */
    if (
      ready &&
      confidence >= 90 &&
      ratio >= 3 &&
      hasStructure &&
      hasLiquidity &&
      hasDisplacement &&
      hasFVG &&
      hasInvalidation
    ) {
      return "A+";
    }

    /*
     * A
     */
    if (
      ready &&
      confidence >= 80 &&
      hasStructure &&
      hasDisplacement &&
      hasFVG &&
      hasInvalidation &&
      hasAcceptableRR
    ) {
      return "A";
    }

    /*
     * B
     *
     * Strong developing setup but not
     * complete enough for A.
     */
    if (
      confidence >= 70 &&
      hasStructure &&
      hasDisplacement &&
      hasFVG
    ) {
      return "B";
    }

    /*
     * C
     */
    if (
      confidence >= 55 &&
      (
        hasStructure ||
        hasLiquidity ||
        hasDisplacement ||
        hasFVG
      )
    ) {
      return "C";
    }

    return "D";
  }

  private static buildRecommendation(
    setup: InstitutionalSetup,
    grade: SetupGrade
  ): string {
    if (
      setup.state ===
      "no_setup"
    ) {
      return (
        "No actionable institutional setup is currently confirmed. Preserve capital and wait for a clearer structural opportunity."
      );
    }

    if (
      setup.state ===
      "forming"
    ) {
      const missing: string[] = [];

      if (
        !setup.liquiditySweep
      ) {
        missing.push(
          "liquidity interaction"
        );
      }

      if (
        !setup.displacement
      ) {
        missing.push(
          "displacement"
        );
      }

      if (
        !setup.fairValueGap
      ) {
        missing.push(
          "FVG entry area"
        );
      }

      if (
        !setup.invalidation
      ) {
        missing.push(
          "invalidation"
        );
      }

      if (
        !setup.riskReward ||
        setup.riskReward.ratio < 2
      ) {
        missing.push(
          "acceptable R:R"
        );
      }

      if (
        missing.length > 0
      ) {
        return (
          `Setup is forming. Wait for ${this.joinNaturalLanguage(missing)} before considering an entry.`
        );
      }

      return (
        "Setup is forming. Wait for the remaining confirmation and avoid chasing price."
      );
    }

    if (
      setup.state ===
        "ready" &&
      grade === "A+" &&
      setup.riskReward
    ) {
      return (
        `High-quality ${setup.direction === "buy" ? "bullish" : "bearish"} setup. Potential R:R is ${setup.riskReward.ratio}:1. Wait for the defined entry area and respect the invalidation level at ${setup.invalidation}.`
      );
    }

    if (
      setup.state ===
      "ready"
    ) {
      return (
        `${setup.direction === "buy" ? "Bullish" : "Bearish"} setup has passed the current technical filters. Potential R:R is ${setup.riskReward?.ratio ?? "not available"}:1. Execute only within the defined entry area and respect invalidation.`
      );
    }

    return (
      "Remain patient and wait for the next confirmed institutional setup."
    );
  }

  private static joinNaturalLanguage(
    values: string[]
  ): string {
    if (
      values.length === 0
    ) {
      return "";
    }

    if (
      values.length === 1
    ) {
      return values[0];
    }

    if (
      values.length === 2
    ) {
      return `${values[0]} and ${values[1]}`;
    }

    return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
  }
}