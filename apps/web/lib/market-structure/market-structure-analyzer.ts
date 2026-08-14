import type {
  MarketCandle,
} from "@/lib/market";

import type {
  MarketStructureAnalysis,
  SwingClassification,
  SwingPoint,
} from "./market-structure-types";

import {
  MarketStructureUtils,
} from "./market-structure-utils";

interface InternalSwing extends SwingPoint {
  index: number;
}

export class MarketStructureAnalyzer {
  /**
   * Analyse real OHLC candles.
   *
   * The algorithm intentionally uses confirmed
   * swings only. A swing requires candles on both
   * sides of the candidate candle.
   */
  static analyzeCandles(
    candles: MarketCandle[],
    timeframe: string,
    swingStrength: number = 2
  ): MarketStructureAnalysis {
    if (candles.length < swingStrength * 2 + 3) {
      return {
        trend: "range",
        structure: "unknown",
        latestEvent: "none",
        higherTimeframeBias: "range",
        confidence: 0,
        swingHigh: null,
        swingLow: null,
        brokenLevel: null,
        brokenAt: null,
        timeframe,
        candleCount: candles.length,
        summary:
          "Not enough candle history to establish reliable market structure.",
        explanation:
          `SmartPulse received ${candles.length} candles on ${timeframe}. ` +
          `At least ${swingStrength * 2 + 3} candles are required for confirmed swing analysis.`,
      };
    }

    const ordered = [...candles].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );

    const swings =
      this.detectSwings(
        ordered,
        swingStrength
      );

    const highs = swings.filter(
      (swing) =>
        swing.type === "high"
    );

    const lows = swings.filter(
      (swing) =>
        swing.type === "low"
    );

    this.classifySwings(highs);

    this.classifySwings(lows);

    const latestHigh =
      highs.length > 0
        ? highs[highs.length - 1]
        : null;

    const latestLow =
      lows.length > 0
        ? lows[lows.length - 1]
        : null;

    const previousHigh =
      highs.length > 1
        ? highs[highs.length - 2]
        : null;

    const previousLow =
      lows.length > 1
        ? lows[lows.length - 2]
        : null;

    const trend =
      this.determineTrend(
        previousHigh,
        latestHigh,
        previousLow,
        latestLow
      );

    const latestCandle =
      ordered[ordered.length - 1];

    const previousStructure =
      this.determinePreviousStructure(
        previousHigh,
        previousLow,
        trend
      );

    const breakResult =
      this.detectStructuralBreak(
        ordered,
        previousHigh,
        previousLow,
        trend
      );

    const latestEvent =
      breakResult.event;

    const structure =
      this.determineStructure(
        trend,
        previousStructure,
        latestEvent
      );

    const confidence =
      this.calculateConfidence(
        ordered.length,
        highs.length,
        lows.length,
        latestEvent,
        trend
      );

    const higherTimeframeBias =
      trend;

    const summary =
      this.buildSummary(
        trend,
        structure,
        latestEvent,
        breakResult.brokenLevel
      );

    const explanation =
      this.buildExplanation(
        timeframe,
        ordered.length,
        latestHigh,
        latestLow,
        trend,
        structure,
        breakResult
      );

    return {
      trend,
      structure,
      latestEvent,
      higherTimeframeBias,
      confidence,
      swingHigh: latestHigh
        ? this.publicSwing(latestHigh)
        : null,
      swingLow: latestLow
        ? this.publicSwing(latestLow)
        : null,
      brokenLevel:
        breakResult.brokenLevel,
      brokenAt:
        breakResult.brokenAt,
      timeframe,
      candleCount:
        ordered.length,
      summary,
      explanation,
    };
  }

  private static detectSwings(
    candles: MarketCandle[],
    strength: number
  ): InternalSwing[] {
    const swings: InternalSwing[] = [];

    for (
      let i = strength;
      i < candles.length - strength;
      i++
    ) {
      const candle = candles[i];

      let isSwingHigh = true;
      let isSwingLow = true;

      for (
        let offset = 1;
        offset <= strength;
        offset++
      ) {
        const left =
          candles[i - offset];

        const right =
          candles[i + offset];

        if (
          candle.high <= left.high ||
          candle.high <= right.high
        ) {
          isSwingHigh = false;
        }

        if (
          candle.low >= left.low ||
          candle.low >= right.low
        ) {
          isSwingLow = false;
        }
      }

      if (isSwingHigh) {
        swings.push({
          price: candle.high,
          time: candle.timestamp,
          type: "high",
          index: i,
        });
      }

      if (isSwingLow) {
        swings.push({
          price: candle.low,
          time: candle.timestamp,
          type: "low",
          index: i,
        });
      }
    }

    return swings.sort(
      (a, b) =>
        a.index - b.index
    );
  }

  private static classifySwings(
    swings: InternalSwing[]
  ): void {
    for (
      let i = 1;
      i < swings.length;
      i++
    ) {
      const previous =
        swings[i - 1];

      const current =
        swings[i];

      let classification:
        | SwingClassification
        | undefined;

      if (
        current.type === "high"
      ) {
        classification =
          current.price >
          previous.price
            ? "HH"
            : "LH";
      } else {
        classification =
          current.price >
          previous.price
            ? "HL"
            : "LL";
      }

      current.classification =
        classification;
    }
  }

  private static determineTrend(
    previousHigh: InternalSwing | null,
    latestHigh: InternalSwing | null,
    previousLow: InternalSwing | null,
    latestLow: InternalSwing | null
  ) {
    if (
      !previousHigh ||
      !latestHigh ||
      !previousLow ||
      !latestLow
    ) {
      return "range" as const;
    }

    const higherHigh =
      latestHigh.price >
      previousHigh.price;

    const higherLow =
      latestLow.price >
      previousLow.price;

    const lowerHigh =
      latestHigh.price <
      previousHigh.price;

    const lowerLow =
      latestLow.price <
      previousLow.price;

    if (
      higherHigh &&
      higherLow
    ) {
      return "bullish" as const;
    }

    if (
      lowerHigh &&
      lowerLow
    ) {
      return "bearish" as const;
    }

    return "range" as const;
  }

  private static determinePreviousStructure(
    previousHigh: InternalSwing | null,
    previousLow: InternalSwing | null,
    trend: "bullish" | "bearish" | "range"
  ) {
    if (
      !previousHigh ||
      !previousLow
    ) {
      return "unknown" as const;
    }

    if (trend === "range") {
      return "range" as const;
    }

    return "impulse" as const;
  }

  private static detectStructuralBreak(
    candles: MarketCandle[],
    previousHigh: InternalSwing | null,
    previousLow: InternalSwing | null,
    trend: "bullish" | "bearish" | "range"
  ) {
    const latest =
      candles[candles.length - 1];

    if (
      previousHigh &&
      latest.close >
        previousHigh.price
    ) {
      return {
        event:
          trend === "bearish"
            ? ("choch" as const)
            : ("bos" as const),

        brokenLevel:
          previousHigh.price,

        brokenAt:
          latest.timestamp,
      };
    }

    if (
      previousLow &&
      latest.close <
        previousLow.price
    ) {
      return {
        event:
          trend === "bullish"
            ? ("choch" as const)
            : ("bos" as const),

        brokenLevel:
          previousLow.price,

        brokenAt:
          latest.timestamp,
      };
    }

    return {
      event: "none" as const,
      brokenLevel: null,
      brokenAt: null,
    };
  }

  private static determineStructure(
    trend: "bullish" | "bearish" | "range",
    previousStructure:
      | "impulse"
      | "range"
      | "unknown",
    event:
      | "none"
      | "bos"
      | "mss"
      | "choch"
  ) {
    if (event === "choch") {
      return "pullback" as const;
    }

    if (event === "bos") {
      return "impulse" as const;
    }

    if (trend === "range") {
      return "range" as const;
    }

    if (
      previousStructure ===
      "unknown"
    ) {
      return "unknown" as const;
    }

    return previousStructure;
  }

  private static calculateConfidence(
    candleCount: number,
    swingHighCount: number,
    swingLowCount: number,
    event:
      | "none"
      | "bos"
      | "mss"
      | "choch",
    trend:
      | "bullish"
      | "bearish"
      | "range"
  ): number {
    let score = 50;

    if (candleCount >= 100) {
      score += 15;
    } else if (candleCount >= 50) {
      score += 10;
    } else if (candleCount >= 25) {
      score += 5;
    }

    if (
      swingHighCount >= 3 &&
      swingLowCount >= 3
    ) {
      score += 15;
    } else if (
      swingHighCount >= 2 &&
      swingLowCount >= 2
    ) {
      score += 8;
    }

    if (event !== "none") {
      score += 8;
    }

    if (trend !== "range") {
      score += 5;
    }

    return MarketStructureUtils.clampConfidence(
      score
    );
  }

  private static buildSummary(
    trend:
      | "bullish"
      | "bearish"
      | "range",
    structure:
      | "impulse"
      | "pullback"
      | "range"
      | "expansion"
      | "unknown",
    event:
      | "none"
      | "bos"
      | "mss"
      | "choch",
    brokenLevel:
      number | null
  ): string {
    if (event !== "none" && brokenLevel !== null) {
      return `${event.toUpperCase()} confirmed at ${brokenLevel}. Current structure is ${structure} with a ${trend} bias.`;
    }

    return `Market structure is currently ${structure} with a ${trend} bias. No confirmed structural break has occurred on this timeframe.`;
  }

  private static buildExplanation(
    timeframe: string,
    candleCount: number,
    latestHigh: InternalSwing | null,
    latestLow: InternalSwing | null,
    trend:
      | "bullish"
      | "bearish"
      | "range",
    structure:
      | "impulse"
      | "pullback"
      | "range"
      | "expansion"
      | "unknown",
    breakResult: {
      event:
        | "none"
        | "bos"
        | "mss"
        | "choch";
      brokenLevel:
        number | null;
      brokenAt:
        string | null;
    }
  ): string {
    const swingDescription =
      [
        latestHigh
          ? `latest swing high ${latestHigh.price}`
          : null,
        latestLow
          ? `latest swing low ${latestLow.price}`
          : null,
      ]
        .filter(Boolean)
        .join(" and ");

    const breakDescription =
      breakResult.event === "none"
        ? "No confirmed structural break is present in the latest candle."
        : `${breakResult.event.toUpperCase()} occurred at ${breakResult.brokenLevel} and was confirmed by the candle at ${breakResult.brokenAt}.`;

    return [
      `Analysis timeframe: ${timeframe}.`,
      `Candle sample: ${candleCount} candles.`,
      swingDescription
        ? `Structural reference: ${swingDescription}.`
        : "No confirmed swing reference is available yet.",
      `Current bias: ${trend}.`,
      `Current structure: ${structure}.`,
      breakDescription,
    ].join(" ");
  }

  private static publicSwing(
    swing: InternalSwing
  ): SwingPoint {
    return {
      price: swing.price,
      time: swing.time,
      type: swing.type,
      classification:
        swing.classification,
    };
  }
}