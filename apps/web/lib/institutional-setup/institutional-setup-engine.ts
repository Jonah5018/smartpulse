import type {
  CandleInterval,
} from "@/lib/market";

import {
  MarketRepository,
} from "@/lib/repositories/market/market-repository";

import {
  MarketStructureService,
} from "@/lib/market-structure";

import {
  ImbalanceEngine,
} from "@/lib/imbalance";

import {
  MultiTimeframeEngine,
} from "@/lib/multi-timeframe";

import type {
  MultiTimeframeAnalysis,
  TraderAnalysisProfile,
} from "@/lib/multi-timeframe";

import type {
  FairValueGap,
} from "@/lib/imbalance";

import type {
  LiquidityAnalysis,
} from "@/lib/institutional/liquidity";

import {
  LiquidityEngine,
} from "@/lib/institutional/liquidity";

import type {
  LiquidityMap,
} from "@/lib/institutional/liquidity";

import type {
  MarketStructureAnalysis,
} from "@/lib/market-structure";

import type {
  InstitutionalSetup,
  SetupContext,
  SetupDirection,
  SetupQuality,
  SetupState,
} from "./institutional-setup-types";

import {
  MarketAvailabilityService,
} from "@/lib/market-session/market-availability-service";

import {
  MSSEngine,
} from "@/lib/institutional/mss";

import {
  OrderBlockEngine,
} from "@/lib/institutional/order-block";

import {
  PremiumDiscountEngine,
} from "@/lib/institutional/premium-discount";

import {
  DisplacementEngine,
} from "@/lib/institutional/displacement";

import {
  ConfluenceEngine,
} from "@/lib/institutional/confluence";

import {
  ExplainabilityEngine,
} from "@/lib/institutional/explainability";

import {
  ExecutionReadinessService,
} from "@/lib/execution-readiness";

export class InstitutionalSetupEngine {
  /**
   * Default intraday profile.
   *
   * This exists for backwards compatibility with
   * existing callers that only provide a symbol
   * and execution timeframe.
   */
  private static readonly DEFAULT_PROFILE:
    TraderAnalysisProfile = {
      timeframes: {
        context: "4h",

        structure: "1h",

        execution: "15min",
      },
    };

  /**
   * Build the current institutional setup.
   *
   * The optional profile allows SmartPulse to
   * eventually use the trader's actual trading
   * style and preferred timeframes.
   *
   * Existing calls such as:
   *
   * current("GBP/USD", "15min", 200)
   *
   * remain valid.
   */
  static async current(
    symbol: string,
    timeframe?: CandleInterval,
    outputsize: number = 200,
    profile?: TraderAnalysisProfile
  ): Promise<InstitutionalSetup> {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error(
        "Market symbol is required."
      );
    }

    const analysisProfile =
      profile ??
      this.profileFromLegacyTimeframe(
        timeframe
      );
      
    const availability =
      MarketAvailabilityService.current(
        normalizedSymbol
      );

    if (!availability.isOpen) {
      return this.noSetup(
        normalizedSymbol,
        analysisProfile,
        `${normalizedSymbol}: ${availability.reason} Live institutional analysis will resume when the market reopens.`
      );
    }

    const executionTimeframe =
      analysisProfile.timeframes.execution;

    const candles =
      await MarketRepository.getCandles(
        symbol,
        executionTimeframe,
        outputsize
      );

    const executionStructure =
      await MarketStructureService.current(
        symbol,
        executionTimeframe,
        outputsize
      );

    const displacement =
      DisplacementEngine.analyze(
        candles,
        executionStructure
      );

    const premiumDiscount =
      PremiumDiscountEngine.analyze(
      candles,
       executionStructure
    );

    const orderBlock =
      OrderBlockEngine.analyze(
        candles,
        executionStructure
 );

    const [
      liquidity,
      imbalance,
      multiTimeframe,
    ] = await Promise.all([
      LiquidityEngine.analyze(
        candles,
        executionStructure,
      ),

      ImbalanceEngine.current(
        symbol,
        executionTimeframe,
        outputsize
      ),

      MultiTimeframeEngine.current(
        symbol,
        analysisProfile
      ),
    ]);

    const latestCandle =
      candles[candles.length - 1];

    if (!latestCandle) {
      return this.noSetup(
        symbol,
        analysisProfile,
        "No candle data is available for setup analysis."
      );
    }

    const currentPrice =
      latestCandle.close;

    /*
     * IMPORTANT:
     *
     * Direction comes from the configured
     * multi-timeframe analysis.
     *
     * We do NOT directly use:
     *
     * executionStructure.higherTimeframeBias
     *
     * because that would incorrectly make a
     * ranging context invalidate a valid
     * lower-timeframe setup.
     */
    const direction =
      this.getSetupDirection(
        multiTimeframe.directionalBias
      );

    const sweepDirection =
      liquidity.latestSweep
        && liquidity.latestSweep.side !== null
        ? this.getSweepDirection(
            liquidity.latestSweep.side
          )
        : null;

    const displacementDirection =
      imbalance.displacement
        ?.direction ?? null;

    /*
     * Evaluate whether the liquidity and
     * displacement story agrees with the
     * multi-timeframe directional context.
     */
    const directionalAlignment =
      this.hasDirectionalAlignment(
        direction,
        sweepDirection,
        displacementDirection,
        multiTimeframe.alignment
      );

    /*
     * Select the FVG that belongs to the
     * execution timeframe and direction.
     */
    const selectedFVG =
      this.selectEntryFVG(
        direction,
        imbalance.fairValueGaps,
        currentPrice
      );

    /*
     * Select the nearest external liquidity
     * in the direction of the setup.
     */
    const targetLiquidity =
      this.selectTargetLiquidity(
        direction,
        liquidity,
        currentPrice
      );

    const confluence =
      ConfluenceEngine.evaluate(
        executionStructure as unknown as Parameters<
          typeof ConfluenceEngine.evaluate
        >[0],
        liquidity,
        orderBlock,
        selectedFVG,
        premiumDiscount,
        displacement
      );

    const entryZone =
      selectedFVG
        ? {
            low:
              selectedFVG.low,

            high:
              selectedFVG.high,

            midpoint:
              selectedFVG.midpoint,
          }
        : null;

    /*
     * Use execution-timeframe structure for
     * the invalidation calculation.
     *
     * The context timeframe is not used as an
     * automatic stop-loss source because the
     * execution setup needs its own structural
     * invalidation.
     */
    const invalidation =
      this.calculateInvalidation(
        direction,
        entryZone,
        executionStructure
      );

    /*
     * If an FVG exists, the midpoint is the
     * working entry model.
     *
     * This is a planning price, not an instruction
     * to enter immediately.
     */
    const entry =
      entryZone?.midpoint ??
      currentPrice;

    const riskReward =
      this.calculateRiskReward(
        direction,
        entry,
        invalidation,
        targetLiquidity?.price ??
          null
      );

    const executionReadiness =
      ExecutionReadinessService.evaluate(
        confluence,
        selectedFVG !== null,
        riskReward !== null,
        directionalAlignment
    );

    const state =
      executionReadiness.state;

    const setupContext =
      this.determineSetupContext(
        multiTimeframe
      );

    const confidence =
      confluence.score;

    const quality =
      confluence.grade === "A+"
        ? "exceptional"
        : confluence.grade === "A"
          ? "high"
          : confluence.grade === "B"
            ? "moderate"
            : "low";

    const liquidityMap: LiquidityMap =
      liquidity;

    const explanationModel =
      ExplainabilityEngine.generate(
        confluence,
        executionStructure,
        liquidityMap,
        orderBlock,
        selectedFVG,
        displacement
   );

    const summary =
      explanationModel.headline;

    const explanation =
      explanationModel.narrative;

    return {
      symbol,

      timeframe:
        executionTimeframe,

      state,

      direction,

      quality,

      confidence,

      confluence,

      executionReadiness,

      explainability:
        explanationModel,

      marketStructure:
        executionStructure.trend,

      structureEvent:
        executionStructure.latestEvent,

      setupContext,

      contextTimeframe:
        analysisProfile.timeframes.context,

      contextTrend:
        multiTimeframe.context.trend,

      structureTimeframe:
        analysisProfile.timeframes.structure,

      executionTimeframe,

      multiTimeframeAlignment:
        multiTimeframe.context.trend ===
          "range"
          ? "range_context"
          : multiTimeframe.alignment ===
              "strong" ||
            multiTimeframe.alignment ===
              "moderate"
            ? "aligned"
            : "partially_aligned",

      liquidity: liquidityMap,

      liquiditySweep:
        liquidity.latestSweep
          ?.side ?? null,

      entryZone,

      invalidation,

      targetLiquidity:
        targetLiquidity?.price ??
        null,

      riskReward,

      displacement,

      fairValueGap:
        entryZone,

      summary,

      explanation,
    };
  }

  /**
   * Preserve compatibility with callers that
   * only provide a single execution timeframe.
   *
   * The execution timeframe is converted into
   * a sensible default context/structure/execution
   * hierarchy.
   */
  private static profileFromLegacyTimeframe(
    timeframe?: CandleInterval
  ): TraderAnalysisProfile {
    if (!timeframe) {
      return this.DEFAULT_PROFILE;
    }

    return {
      timeframes: {
        context:
          this.getDefaultContextTimeframe(
            timeframe
          ),

        structure:
          this.getDefaultStructureTimeframe(
            timeframe
          ),

        execution:
          this.getDefaultExecutionTimeframe(
            timeframe
          ),
      },
    };
  }

  private static getDefaultContextTimeframe(
    execution: CandleInterval
  ): TraderAnalysisProfile["timeframes"]["context"] {
    switch (execution) {
      case "1min":
      case "5min":
        return "1h";

      case "15min":
      case "30min":
        return "4h";

      case "1h":
      case "2h":
      case "4h":
        return "4h";

      case "8h":
      case "1day":
        return "4h";

      default:
        return "4h";
    }
  }

  private static getDefaultStructureTimeframe(
    execution: CandleInterval
  ): TraderAnalysisProfile["timeframes"]["structure"] {
    switch (execution) {
      case "1min":
      case "5min":
        return "15min";

      case "15min":
      case "30min":
        return "1h";

      case "1h":
      case "2h":
        return "4h";

      case "4h":
      case "8h":
      case "1day":
        return "4h";

      default:
        return "1h";
    }
  }

  private static getDefaultExecutionTimeframe(
    execution: CandleInterval
  ): TraderAnalysisProfile["timeframes"]["execution"] {
    switch (execution) {
      case "1min":
      case "5min":
        return "15min";

      default:
        return execution as TraderAnalysisProfile["timeframes"]["execution"];
    }
  }

  /**
   * Convert the multi-timeframe directional
   * bias into setup direction.
   */
  private static getSetupDirection(
    bias:
      | "bullish"
      | "bearish"
      | "neutral"
  ): SetupDirection {
    if (bias === "bullish") {
      return "buy";
    }

    if (bias === "bearish") {
      return "sell";
    }

    return "neutral";
  }

  /**
   * A sell-side liquidity sweep can precede
   * bullish expansion.
   *
   * A buy-side liquidity sweep can precede
   * bearish expansion.
   */
  private static getSweepDirection(
    side:
      | "buy_side"
      | "sell_side"
  ): SetupDirection {
    if (
      side === "sell_side"
    ) {
      return "buy";
    }

    return "sell";
  }

  /**
   * Determine whether the execution-timeframe
   * evidence agrees with the multi-timeframe
   * directional context.
   *
   * A range_context is NOT treated as failure.
   */
  private static hasDirectionalAlignment(
    direction: SetupDirection,
    sweepDirection:
      | SetupDirection
      | null,
    displacementDirection:
      | "bullish"
      | "bearish"
      | null,
    multiTimeframeAlignment:
      MultiTimeframeAnalysis["alignment"]
  ): boolean {
    if (
      direction === "neutral"
    ) {
      return false;
    }

    const sweepAligned =
      sweepDirection === null ||
      sweepDirection ===
        direction;

    const displacementSetupDirection:
      | SetupDirection
      | null =
      displacementDirection ===
      "bullish"
        ? "buy"
        : displacementDirection ===
            "bearish"
          ? "sell"
          : null;

    const displacementAligned =
      displacementSetupDirection ===
        null ||
      displacementSetupDirection ===
        direction;

    return (
      sweepAligned &&
      displacementAligned
    );
  }

  /**
   * Select an active FVG that can serve as
   * a potential execution area.
   *
   * We deliberately prefer an unmitigated FVG
   * that is reasonably positioned relative to
   * current price.
   */
  private static selectEntryFVG(
    direction: SetupDirection,
    fairValueGaps: FairValueGap[],
    currentPrice: number
  ): FairValueGap | null {
    if (
      direction === "neutral"
    ) {
      return null;
    }

    const desiredDirection =
      direction === "buy"
        ? "bullish"
        : "bearish";

    const activeGaps =
      fairValueGaps.filter(
        (gap) =>
          gap.direction ===
            desiredDirection &&
          !gap.isMitigated
      );

    if (
      activeGaps.length === 0
    ) {
      return null;
    }

    /*
     * Prefer FVGs that are either currently
     * containing price or are still ahead in
     * the direction from which a retracement
     * could occur.
     *
     * We don't automatically reject a gap merely
     * because price is on the other side; the
     * distance ranking lets the nearest relevant
     * gap win.
     */
    return activeGaps.reduce(
      (
        nearest,
        current
      ) => {
        const nearestDistance =
          this.distanceToZone(
            currentPrice,
            nearest.low,
            nearest.high
          );

        const currentDistance =
          this.distanceToZone(
            currentPrice,
            current.low,
            current.high
          );

        if (
          currentDistance <
          nearestDistance
        ) {
          return current;
        }

        if (
          currentDistance ===
            nearestDistance &&
          current.strength >
            nearest.strength
        ) {
          return current;
        }

        return nearest;
      }
    );
  }

  private static distanceToZone(
    price: number,
    low: number,
    high: number
  ): number {
    if (
      price >= low &&
      price <= high
    ) {
      return 0;
    }

    if (price < low) {
      return low - price;
    }

    return price - high;
  }

  /**
   * Select the nearest external liquidity
   * in the intended direction.
   */
  private static selectTargetLiquidity(
    direction: SetupDirection,
    liquidity: LiquidityAnalysis,
    currentPrice: number
  ) {
    if (
      direction === "buy"
    ) {
      const target =
        liquidity.nearestBuySide;

      if (
        target &&
        target.price >
          currentPrice
      ) {
        return target;
      }

      return null;
    }

    if (
      direction === "sell"
    ) {
      const target =
        liquidity.nearestSellSide;

      if (
        target &&
        target.price <
          currentPrice
      ) {
        return target;
      }

      return null;
    }

    return null;
  }

  /**
   * Calculate execution-timeframe invalidation.
   *
   * The structural swing must actually be on
   * the correct side of the proposed entry.
   */
  private static calculateInvalidation(
    direction: SetupDirection,
    entryZone: {
      low: number;
      high: number;
      midpoint: number;
    } | null,
    structure: MarketStructureAnalysis
  ): number | null {
    const entry =
      entryZone?.midpoint ??
      null;

    if (
      direction === "buy"
    ) {
      const swingLow =
        structure.swingLow?.price ??
        null;

      if (
        swingLow !== null &&
        (entry === null ||
          swingLow < entry)
      ) {
        return swingLow;
      }

      if (entryZone) {
        return entryZone.low;
      }

      return null;
    }

    if (
      direction === "sell"
    ) {
      const swingHigh =
        structure.swingHigh?.price ??
        null;

      if (
        swingHigh !== null &&
        (entry === null ||
          swingHigh > entry)
      ) {
        return swingHigh;
      }

      if (entryZone) {
        return entryZone.high;
      }

      return null;
    }

    return null;
  }

  /**
   * Calculate potential R:R.
   *
   * This is a planning metric, not a guarantee
   * that the target will be reached.
   */
  private static calculateRiskReward(
    direction: SetupDirection,
    entry: number,
    stopLoss: number | null,
    target: number | null
  ) {
    if (
      direction === "neutral" ||
      stopLoss === null ||
      target === null
    ) {
      return null;
    }

    const risk =
      Math.abs(
        entry - stopLoss
      );

    const reward =
      Math.abs(
        target - entry
      );

    if (
      risk <= 0 ||
      reward <= 0
    ) {
      return null;
    }

    /*
     * Make sure the target and stop are
     * logically positioned relative to direction.
     */
    if (
      direction === "buy" &&
      (stopLoss >= entry ||
        target <= entry)
    ) {
      return null;
    }

    if (
      direction === "sell" &&
      (stopLoss <= entry ||
        target >= entry)
    ) {
      return null;
    }

    return {
      entry,

      stopLoss,

      target,

      risk,

      reward,

      ratio:
        Number(
          (
            reward / risk
          ).toFixed(2)
        ),
    };
  }

  /**
   * Determine whether the technical evidence
   * is sufficient to call the setup ready.
   *
   * SmartPulse does not call an FVG alone
   * a ready trade.
   */
  private static determineState(
    direction: SetupDirection,
    aligned: boolean,
    hasFVG: boolean,
    displacementDirection:
      | "bullish"
      | "bearish"
      | null,
    riskReward: {
      ratio: number;
    } | null
  ): SetupState {
    if (
      direction === "neutral"
    ) {
      return "no_setup";
    }

    if (!aligned) {
      return "forming";
    }

    if (
      !displacementDirection
    ) {
      return "forming";
    }

    if (!hasFVG) {
      return "forming";
    }

    /*
     * R:R below 2:1 does not automatically mean
     * the market is bad. It means SmartPulse does
     * not consider the current setup sufficiently
     * attractive for READY status.
     */
    if (
      !riskReward ||
      riskReward.ratio < 2
    ) {
      return "forming";
    }

    return "ready";
  }

  /**
   * Technical confidence is weighted toward
   * multi-timeframe context and execution
   * evidence rather than news/fundamentals.
   *
   * This is consistent with SmartPulse's core
   * philosophy: technical analysis is the primary
   * analysis engine.
   */
  private static calculateConfidence(
    multiTimeframeConfidence: number,
    executionStructureConfidence: number,
    liquidityConfidence: number,
    imbalanceConfidence: number,
    aligned: boolean,
    hasFVG: boolean,
    hasRiskReward: boolean,
    setupContext: SetupContext
  ): number {
    let score =
      multiTimeframeConfidence *
        0.30 +
      executionStructureConfidence *
        0.25 +
      liquidityConfidence *
        0.20 +
      imbalanceConfidence *
        0.25;

    if (!aligned) {
      score -= 15;
    }

    if (hasFVG) {
      score += 5;
    }

    if (hasRiskReward) {
      score += 5;
    }

    /*
     * Being inside a higher-timeframe range
     * is contextual, not automatically negative.
     *
     * We apply no penalty here.
     */
    if (
      setupContext ===
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

  private static getQuality(
    confidence: number,
    riskReward: {
      ratio: number;
    } | null
  ): SetupQuality {
    if (
      confidence >= 90 &&
      (riskReward?.ratio ?? 0) >=
        3
    ) {
      return "exceptional";
    }

    if (
      confidence >= 75
    ) {
      return "high";
    }

    if (
      confidence >= 55
    ) {
      return "moderate";
    }

    return "low";
  }

  /**
   * Translate the multi-timeframe alignment
   * into setup context.
   */
  private static determineSetupContext(
    multiTimeframe: MultiTimeframeAnalysis
  ): SetupContext {
    if (
      multiTimeframe.context.trend ===
      "range"
    ) {
      return "inside_range";
    }

    if (
      multiTimeframe.alignment ===
        "weak" ||
      multiTimeframe.alignment ===
        "mixed"
    ) {
      return "with_context";
    }

    return "unclear";
  }

  private static buildSummary(
    symbol: string,
    state: SetupState,
    direction: SetupDirection,
    setupContext: SetupContext,
    multiTimeframe: MultiTimeframeAnalysis,
    entryZone: {
      low: number;
      high: number;
      midpoint: number;
    } | null,
    target: number | null,
    riskReward: {
      ratio: number;
    } | null
  ): string {
    if (
      state === "no_setup"
    ) {
      return (
        `${symbol}: no directional ICT/SMC setup is currently confirmed.`
      );
    }

    const directionLabel =
      direction === "buy"
        ? "bullish"
        : "bearish";

    const parts: string[] = [
      `${symbol}: ${directionLabel} setup ${state}.`,
    ];

    if (
      setupContext ===
      "inside_range"
    ) {
      parts.push(
        `The setup is developing inside the broader ${multiTimeframe.context.timeframe} ${multiTimeframe.context.trend} context.`
      );
    }

    if (
      setupContext ===
      "countertrend"
    ) {
      parts.push(
        "The execution move is counter to the configured multi-timeframe context."
      );
    }

    if (entryZone) {
      parts.push(
        `Potential FVG entry zone ${entryZone.low}–${entryZone.high}.`
      );
    }

    if (target !== null) {
      parts.push(
        `Target liquidity around ${target}.`
      );
    }

    if (riskReward) {
      parts.push(
        `Potential R:R 1:${riskReward.ratio}.`
      );
    }

    if (
      state === "forming"
    ) {
      parts.push(
        "Wait for the remaining confirmation rather than chasing price."
      );
    }

    if (
      state === "ready"
    ) {
      parts.push(
        "Technical conditions are aligned; execute only according to the trader's risk plan."
      );
    }

    return parts.join(" ");
  }

  private static buildExplanation(
    direction: SetupDirection,
    setupContext: SetupContext,
    multiTimeframe: MultiTimeframeAnalysis,
    executionStructure: MarketStructureAnalysis,
    liquidity: LiquidityAnalysis,
    imbalanceSummary: string,
    entryZone: {
      low: number;
      high: number;
      midpoint: number;
    } | null,
    target: number | null,
    riskReward: {
      ratio: number;
    } | null,
    state: SetupState
  ): string {
    const sections: string[] = [];

    sections.push(
      `MULTI-TIMEFRAME CONTEXT:\n${multiTimeframe.explanation}`
    );

    sections.push(
      `EXECUTION STRUCTURE:\n${executionStructure.summary}`
    );

    sections.push(
      `LIQUIDITY:\n${liquidity.summary}`
    );

    sections.push(
      `DISPLACEMENT / FVG:\n${imbalanceSummary}`
    );

    if (entryZone) {
      sections.push(
        `ENTRY AREA: ${entryZone.low}–${entryZone.high}.`
      );
    }

    if (target !== null) {
      sections.push(
        `TARGET LIQUIDITY: ${target}.`
      );
    }

    if (riskReward) {
      sections.push(
        `RISK/REWARD: 1:${riskReward.ratio} potential.`
      );
    }

    if (
      setupContext ===
      "inside_range"
    ) {
      sections.push(
        "CONTEXT NOTE: The broader range is contextual and is not being used as an automatic setup veto. Range highs, range lows and associated liquidity should instead be treated as important structural boundaries and potential targets."
      );
    }

    if (
      direction === "neutral"
    ) {
      sections.push(
        "DECISION: Stand aside. The configured timeframes do not currently establish a usable directional edge."
      );
    } else if (
      state === "forming"
    ) {
      sections.push(
        "DECISION: Setup is developing. Wait for confirmation instead of entering early."
      );
    } else {
      sections.push(
        "DECISION: Setup has passed the current technical filters. Continue to respect invalidation and risk limits."
      );
    }

    return sections.join(
      "\n\n"
    );
  }

  private static noSetup(
    symbol: string,
    profile: TraderAnalysisProfile,
    reason: string
  ): InstitutionalSetup {
    return {
      symbol,

      timeframe:
        profile.timeframes.execution,

      state: "no_setup",

      direction: "neutral",

      quality: "low",

      confidence: 0,

      confluence: {
        score: 0,
        grade: "C",
        confirmations: 0,
        breakdown: {
          structure: 0,
          liquidity: 0,
          orderBlock: 0,
          fairValueGap: 0,
          premiumDiscount: 0,
          displacement: 0,
        },
        valid: false,
      },
      executionReadiness: {
        state: "no_setup",
        score: 0,
        confirmations: [],
        missing: [
          "Market is unavailable.",
     ],
      explanation: reason,
     },

      explainability: {
        headline:
          "No institutional setup",

        narrative:
          reason,

        confirmations: [],

        warnings: [],
      },

      marketStructure: "range",

      structureEvent: "none",

      setupContext: "unclear",

      contextTimeframe:
        profile.timeframes.context,

      contextTrend: "range",

      structureTimeframe:
        profile.timeframes.structure,

      executionTimeframe:
        profile.timeframes.execution,

      multiTimeframeAlignment:
        "range_context",
      liquidity: {
        nearestBuySide: null,
        nearestSellSide: null,
        latestSweep: null,
        confidence: 0,
        summary: reason,
      } as unknown as LiquidityAnalysis,

      liquiditySweep: null,

      entryZone: null,

      invalidation: null,

      targetLiquidity: null,

      riskReward: null,

      displacement:
        null as unknown as InstitutionalSetup["displacement"],

      fairValueGap: null,

      summary: reason,

      explanation: reason,
    };
  }
}
