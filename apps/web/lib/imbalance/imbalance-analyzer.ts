import type {
  MarketCandle,
} from "@/lib/market";

import type {
  Displacement,
  FairValueGap,
  ImbalanceAnalysis,
} from "./imbalance-types";

export class ImbalanceAnalyzer {
  static analyze(
    candles: MarketCandle[],
    timeframe: string
  ): ImbalanceAnalysis {
    const ordered =
      [...candles].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
      );

    if (ordered.length < 5) {
      return {
        symbol:
          ordered[0]?.symbol ??
          "UNKNOWN",

        timeframe,

        candleCount:
          ordered.length,

        displacement: null,

        fairValueGaps: [],

        nearestBullishFVG: null,

        nearestBearishFVG: null,

        confidence: 0,

        summary:
          "Not enough candle history to evaluate displacement and Fair Value Gaps.",
      };
    }

    const displacement =
      this.detectDisplacement(
        ordered
      );

    const fairValueGaps =
      this.detectFairValueGaps(
        ordered
      );

    const currentPrice =
      ordered[
        ordered.length - 1
      ].close;

    const nearestBullishFVG =
      this.findNearestFVG(
        fairValueGaps,
        "bullish",
        currentPrice
      );

    const nearestBearishFVG =
      this.findNearestFVG(
        fairValueGaps,
        "bearish",
        currentPrice
      );

    const confidence =
      this.calculateConfidence(
        ordered.length,
        displacement,
        fairValueGaps
      );

    const summary =
      this.buildSummary(
        displacement,
        nearestBullishFVG,
        nearestBearishFVG
      );

    return {
      symbol:
        ordered[
          ordered.length - 1
        ].symbol,

      timeframe,

      candleCount:
        ordered.length,

      displacement,

      fairValueGaps,

      nearestBullishFVG,

      nearestBearishFVG,

      confidence,

      summary,
    };
  }

  /**
   * Detect the most recent meaningful displacement.
   *
   * Displacement is deliberately measured relative
   * to the recent candle population instead of using
   * a fixed pip threshold. This allows the engine to
   * work across GBP/USD, USD/JPY, XAU/USD, etc.
   */
  private static detectDisplacement(
    candles: MarketCandle[]
  ): Displacement | null {
    const lookback = Math.min(
      20,
      candles.length - 1
    );

    if (lookback < 5) {
      return null;
    }

    const start =
      candles.length - lookback;

    const historicalRanges =
      candles
        .slice(start, candles.length - 1)
        .map(
          (candle) =>
            candle.high -
            candle.low
        )
        .filter(
          (range) => range > 0
        );

    const historicalBodies =
      candles
        .slice(start, candles.length - 1)
        .map(
          (candle) =>
            Math.abs(
              candle.close -
                candle.open
            )
        )
        .filter(
          (body) => body > 0
        );

    if (
      historicalRanges.length === 0 ||
      historicalBodies.length === 0
    ) {
      return null;
    }

    const averageRange =
      this.average(
        historicalRanges
      );

    const averageBody =
      this.average(
        historicalBodies
      );

    let latest:
      Displacement | null = null;

    for (
      let i = start;
      i < candles.length;
      i++
    ) {
      const candle =
        candles[i];

      const range =
        candle.high -
        candle.low;

      const body =
        Math.abs(
          candle.close -
            candle.open
        );

      if (
        range <= 0 ||
        body <= 0
      ) {
        continue;
      }

      const bodyToRangeRatio =
        body / range;

      const relativeBodyStrength =
        body /
        Math.max(
          averageBody,
          Number.EPSILON
        );

      /*
       * These are structural filters, not trade
       * signals:
       *
       * - candle range must be meaningfully larger
       *   than the recent average;
       * - body must occupy a substantial part of
       *   the candle;
       * - body must be materially larger than the
       *   recent average body.
       */
      const hasExpansion =
        range >=
        averageRange * 1.35;

      const hasStrongBody =
        bodyToRangeRatio >=
        0.65;

      const hasRelativeStrength =
        relativeBodyStrength >=
        1.5;

      if (
        !hasExpansion ||
        !hasStrongBody ||
        !hasRelativeStrength
      ) {
        continue;
      }

      const direction =
        candle.close >
        candle.open
          ? "bullish"
          : "bearish";

      const confidence =
        this.clamp(
          50 +
            (range /
              Math.max(
                averageRange,
                Number.EPSILON
              ) -
              1) *
              20 +
            bodyToRangeRatio *
              20 +
            Math.min(
              relativeBodyStrength *
                5,
              10
            ),
          0,
          100
        );

      latest = {
        symbol:
          candle.symbol,

        direction,

        timestamp:
          candle.timestamp,

        candleIndex: i,

        open:
          candle.open,

        high:
          candle.high,

        low:
          candle.low,

        close:
          candle.close,

        bodySize:
          body,

        rangeSize:
          range,

        bodyToRangeRatio,

        relativeBodyStrength,

        confidence:
          Math.round(
            confidence
          ),
      };
    }

    return latest;
  }

  /**
   * Detect the classic three-candle ICT Fair Value
   * Gap structure.
   *
   * Bullish:
   *
   * Candle 1 high < Candle 3 low
   *
   * Bearish:
   *
   * Candle 1 low > Candle 3 high
   */
  private static detectFairValueGaps(
    candles: MarketCandle[]
  ): FairValueGap[] {
    const gaps:
      FairValueGap[] = [];

    for (
      let i = 2;
      i < candles.length;
      i++
    ) {
      const first =
        candles[i - 2];

      const middle =
        candles[i - 1];

      const third =
        candles[i];

      /*
       * Bullish FVG:
       *
       * first.high < third.low
       */
      if (
        first.high <
        third.low
      ) {
        const low =
          first.high;

        const high =
          third.low;

        const size =
          high - low;

        if (size > 0) {
          gaps.push({
            symbol:
              third.symbol,

            direction:
              "bullish",

            timeframe:
              third.interval,

            high,

            low,

            midpoint:
              (high + low) / 2,

            size,

            timestamp:
              middle.timestamp,

            firstCandleTimestamp:
              first.timestamp,

            thirdCandleTimestamp:
              third.timestamp,

            isMitigated:
              this.isFVGmitigated(
                candles,
                i,
                low,
                high
              ),

            mitigationPercent:
              this.calculateMitigation(
                candles,
                i,
                low,
                high
              ),

            strength:
              this.calculateFVGStrength(
                first,
                middle,
                third,
                size
              ),
          });
        }
      }

      /*
       * Bearish FVG:
       *
       * first.low > third.high
       */
      if (
        first.low >
        third.high
      ) {
        const low =
          third.high;

        const high =
          first.low;

        const size =
          high - low;

        if (size > 0) {
          gaps.push({
            symbol:
              third.symbol,

            direction:
              "bearish",

            timeframe:
              third.interval,

            high,

            low,

            midpoint:
              (high + low) / 2,

            size,

            timestamp:
              middle.timestamp,

            firstCandleTimestamp:
              first.timestamp,

            thirdCandleTimestamp:
              third.timestamp,

            isMitigated:
              this.isFVGmitigated(
                candles,
                i,
                low,
                high
              ),

            mitigationPercent:
              this.calculateMitigation(
                candles,
                i,
                low,
                high
              ),

            strength:
              this.calculateFVGStrength(
                first,
                middle,
                third,
                size
              ),
          });
        }
      }
    }

    return gaps
      .sort(
        (a, b) =>
          new Date(
            b.timestamp
          ).getTime() -
          new Date(
            a.timestamp
          ).getTime()
      )
      .slice(0, 20);
  }

  private static isFVGmitigated(
    candles: MarketCandle[],
    formationIndex: number,
    low: number,
    high: number
  ): boolean {
    for (
      let i =
        formationIndex + 1;
      i < candles.length;
      i++
    ) {
      const candle =
        candles[i];

      if (
        candle.low <=
          low &&
        candle.high >=
          high
      ) {
        return true;
      }
    }

    return false;
  }

  private static calculateMitigation(
    candles: MarketCandle[],
    formationIndex: number,
    low: number,
    high: number
  ): number {
    const size =
      high - low;

    if (size <= 0) {
      return 100;
    }

    let maximumMitigation =
      0;

    for (
      let i =
        formationIndex + 1;
      i < candles.length;
      i++
    ) {
      const candle =
        candles[i];

      let mitigation =
        0;

      if (
        candle.low < high &&
        candle.low > low
      ) {
        mitigation =
          ((high -
            candle.low) /
            size) *
          100;
      }

      if (
        candle.high > low &&
        candle.high < high
      ) {
        mitigation =
          ((candle.high -
            low) /
            size) *
          100;
      }

      if (
        candle.low <= low ||
        candle.high >= high
      ) {
        mitigation = 100;
      }

      maximumMitigation =
        Math.max(
          maximumMitigation,
          mitigation
        );
    }

    return Math.round(
      this.clamp(
        maximumMitigation,
        0,
        100
      )
    );
  }

  private static calculateFVGStrength(
    first: MarketCandle,
    middle: MarketCandle,
    third: MarketCandle,
    gapSize: number
  ): number {
    const middleRange =
      middle.high -
      middle.low;

    const middleBody =
      Math.abs(
        middle.close -
          middle.open
      );

    const middleBodyRatio =
      middleRange > 0
        ? middleBody /
          middleRange
        : 0;

    const firstRange =
      first.high -
      first.low;

    const thirdRange =
      third.high -
      third.low;

    const surroundingAverage =
      this.average([
        firstRange,
        thirdRange,
      ]);

    const relativeGap =
      gapSize /
      Math.max(
        surroundingAverage,
        Number.EPSILON
      );

    return Math.round(
      this.clamp(
        45 +
          middleBodyRatio *
            25 +
          Math.min(
            relativeGap * 20,
            20
          ),
        0,
        100
      )
    );
  }

  private static findNearestFVG(
    gaps: FairValueGap[],
    direction:
      | "bullish"
      | "bearish",
    currentPrice: number
  ): FairValueGap | null {
    const candidates =
      gaps.filter(
        (gap) => {
          if (
            gap.direction !==
            direction
          ) {
            return false;
          }

          /*
           * Prefer unmitigated gaps.
           * A mitigated gap can still be useful
           * historically, but it should not be
           * presented as the primary active FVG.
           */
          return (
            !gap.isMitigated
          );
        }
      );

    if (
      candidates.length === 0
    ) {
      return null;
    }

    return candidates.reduce(
      (nearest, current) => {
        const nearestDistance =
          this.distanceToRange(
            currentPrice,
            nearest.low,
            nearest.high
          );

        const currentDistance =
          this.distanceToRange(
            currentPrice,
            current.low,
            current.high
          );

        return currentDistance <
          nearestDistance
          ? current
          : nearest;
      }
    );
  }

  private static distanceToRange(
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

  private static calculateConfidence(
    candleCount: number,
    displacement:
      | Displacement
      | null,
    gaps: FairValueGap[]
  ): number {
    let score = 35;

    if (
      candleCount >= 100
    ) {
      score += 20;
    } else if (
      candleCount >= 50
    ) {
      score += 12;
    }

    if (displacement) {
      score += 25;
    }

    const activeGaps =
      gaps.filter(
        (gap) =>
          !gap.isMitigated
      );

    if (
      activeGaps.length >= 3
    ) {
      score += 15;
    } else if (
      activeGaps.length >= 1
    ) {
      score += 8;
    }

    return Math.round(
      this.clamp(
        score,
        0,
        100
      )
    );
  }

  private static buildSummary(
    displacement:
      | Displacement
      | null,
    nearestBullishFVG:
      | FairValueGap
      | null,
    nearestBearishFVG:
      | FairValueGap
      | null
  ): string {
    const parts: string[] = [];

    if (displacement) {
      parts.push(
        `${displacement.direction} displacement detected at ${displacement.close}.`
      );
    } else {
      parts.push(
        "No significant displacement has been confirmed recently."
      );
    }

    if (
      nearestBullishFVG
    ) {
      parts.push(
        `Nearest active bullish FVG: ${nearestBullishFVG.low}–${nearestBullishFVG.high}.`
      );
    }

    if (
      nearestBearishFVG
    ) {
      parts.push(
        `Nearest active bearish FVG: ${nearestBearishFVG.low}–${nearestBearishFVG.high}.`
      );
    }

    if (
      !nearestBullishFVG &&
      !nearestBearishFVG
    ) {
      parts.push(
        "No active unmitigated FVG was identified in the available candle history."
      );
    }

    return parts.join(" ");
  }

  private static average(
    values: number[]
  ): number {
    if (
      values.length === 0
    ) {
      return 0;
    }

    return (
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / values.length
    );
  }

  private static clamp(
    value: number,
    minimum: number,
    maximum: number
  ): number {
    return Math.max(
      minimum,
      Math.min(
        maximum,
        value
      )
    );
  }
}