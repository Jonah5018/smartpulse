import { calendarReferenceLevels, protectedSwing } from "./reference-levels";
import { ImbalanceAnalyzer } from "@/lib/imbalance/imbalance-analyzer";
import type {
  AnalysisContext,
  TimeframeAnalysisContext,
} from "@/lib/institutional-setup/analysis-context";
import type { MultiTimeframeAnalysis } from "@/lib/multi-timeframe";
import type { LiquidityAnalysis } from "@/lib/institutional/liquidity";
import type { ImbalanceAnalysis } from "@/lib/imbalance";
import type { Displacement } from "@/lib/institutional/displacement";
import type { PremiumDiscountArray } from "@/lib/institutional/premium-discount";
import type { PriceActionAnalysis, PriceActionState } from "./price-action-types";
import { candleContext } from "./candle-context";
import { priceZones } from "./price-zones";
import { breakoutQuality } from "./breakout-quality";

interface PriceActionInput {
  execution: TimeframeAnalysisContext;
  context: AnalysisContext;
  multiTimeframe: MultiTimeframeAnalysis;
  liquidity: LiquidityAnalysis;
  imbalance: ImbalanceAnalysis;
  displacement: Displacement;
  premiumDiscount: PremiumDiscountArray;
}

/** Contextual reasoning over the existing ICT/SMC evidence, with no I/O or score. */
export class PriceActionEngine {
  static analyze(input: PriceActionInput): PriceActionAnalysis {
    const {
      execution,
      context,
      multiTimeframe,
      liquidity,
      imbalance,
      displacement,
      premiumDiscount,
    } = input;
    const { candles, structure, external } = execution;
    const latest = candles.at(-1);
    const direction = multiTimeframe.directionalBias;
    const candle = candleContext(candles);
    const breakout = breakoutQuality(candles, structure, displacement);
    const calendarLevels = calendarReferenceLevels(context);
    const frameMinutes: Record<string, number> = {
      "1min": 1,
      "5min": 5,
      "15min": 15,
      "30min": 30,
      "1h": 60,
      "2h": 120,
      "4h": 240,
      "8h": 480,
      "1day": 1440,
    };
    const isHigherTimeframe = (frame: string) =>
      frameMinutes[frame] > frameMinutes[structure.timeframe];
    const higherTimeframeGaps = Object.entries(context)
      .filter(([frame]) => isHigherTimeframe(frame))
      .flatMap(([frame, item]) =>
        item ? ImbalanceAnalyzer.analyze(item.candles, frame).fairValueGaps : [],
      );
    const zones = Object.values(context).flatMap((item) =>
      item ? priceZones(item) : [],
    );
    const conflicts: string[] = [];
    const missing: string[] = [
      "Volume and order flow are not supplied by this OHLC feed.",
      "Named-session levels are unavailable until exchange calendars and daylight-saving rules are configured.",
    ];
    for (const period of ["previous_day", "previous_week"]) {
      if (!calendarLevels.some((level) => level.period === period)) {
        missing.push(
          period.replaceAll("_", " ") +
            " levels are unavailable: complete UTC history is missing.",
        );
      }
    }
    const evidence: string[] = [
      multiTimeframe.context.timeframe +
        " context is " +
        multiTimeframe.context.trend +
        ".",
      multiTimeframe.structure.timeframe +
        " structure is " +
        multiTimeframe.structure.trend +
        ".",
      structure.timeframe + " execution structure is " + structure.trend + ".",
      liquidity.summary,
      breakout.explanation,
    ];

    if (
      direction !== "neutral" &&
      [multiTimeframe.context, multiTimeframe.structure, multiTimeframe.execution].some(
        (item) => item.trend !== "range" && item.trend !== direction,
      )
    ) {
      conflicts.push(
        "The configured timeframes disagree; execution has not aligned with higher-level context.",
      );
    }

    const opposingZone = zones.find((zone) => {
      const opposing =
        direction === "bullish" ? zone.kind === "supply" : zone.kind === "demand";
      return (
        latest &&
        opposing &&
        zone.status !== "mitigated" &&
        isHigherTimeframe(zone.timeframe) &&
        latest.close >= zone.low &&
        latest.close <= zone.high
      );
    });

    if (opposingZone)
      conflicts.push("Price is inside an opposing higher-timeframe zone.");
    if (breakout.state === "false_breakout")
      conflicts.push("The recent breakout failed to hold.");

    const alignedGaps = imbalance.fairValueGaps.filter(
      (gap) =>
        gap.direction === direction &&
        !gap.isMitigated &&
        gap.mitigationPercent < 100 &&
        gap.strength >= 60,
    );
    const directionalSweep = liquidity.latestSweep?.direction === direction;
    const zoneReaction =
      !!latest &&
      candle.directionalRejection === direction &&
      zones.some((zone) => {
        const aligned =
          direction === "bullish"
            ? zone.kind === "demand" || zone.kind === "support"
            : zone.kind === "supply" || zone.kind === "resistance";
        return (
          aligned &&
          zone.status !== "mitigated" &&
          zone.retests <= 1 &&
          latest.low <= zone.high &&
          latest.high >= zone.low
        );
      });
    const protectedLow =
      external.trend === "bullish" ? protectedSwing(candles, external, "low") : null;
    const protectedHigh =
      external.trend === "bearish" ? protectedSwing(candles, external, "high") : null;
    const invalidation =
      direction === "bullish"
        ? protectedLow
        : direction === "bearish"
          ? protectedHigh
          : null;

    let state: PriceActionState = "observation";

    if (!latest || candles.length < 20 || structure.structure === "unknown") {
      state = "insufficient_data";
      missing.push("Meaningful confirmed swing history is incomplete.");
    } else if (breakout.state === "false_breakout") {
      state = "invalid_setup";
    } else if (
      direction === "neutral" ||
      (candle.phase === "compression" && !directionalSweep)
    ) {
      state = "no_trade";
    } else if (conflicts.length > 0) {
      state = "developing_setup";
    } else if (
      breakout.state === "confirmed" &&
      displacement.direction === direction &&
      alignedGaps.length > 0 &&
      (directionalSweep || zoneReaction)
    ) {
      state = "confirmed_setup";
    } else if (directionalSweep || zoneReaction || breakout.state === "retest") {
      state = "developing_setup";
    } else if (alignedGaps.length > 0 || structure.latestEvent !== "none") {
      state = "potential_setup";
    }

    const reversal = structure.latestEvent === "choch" || structure.latestEvent === "mss";
    const setupType =
      state === "no_trade"
        ? "no_trade_environment"
        : state === "invalid_setup"
          ? "invalid_breakout"
          : state === "insufficient_data"
            ? "insufficient_data"
            : state === "confirmed_setup"
              ? direction + (reversal ? "_reversal" : "_continuation")
              : directionalSweep
                ? "liquidity_sweep_reversal"
                : zoneReaction
                  ? direction === "bullish"
                    ? "demand_rejection"
                    : "supply_rejection"
                  : breakout.state === "retest"
                    ? "breakout_retest"
                    : "waiting_for_confirmation";
    const waitFor =
      state === "confirmed_setup"
        ? "Monitor the retracement zone and structural invalidation; confirmation is not an instruction to trade."
        : conflicts.length
          ? "Wait for conflicting structure to resolve and for a new aligned confirmation."
          : "Wait for a close through meaningful structure, directional displacement and a reaction at the planned zone.";
    const location =
      structure.swingHigh && structure.swingLow ? premiumDiscount.zone : "unavailable";
    evidence.push(
      "Dealing-range location: " +
        location +
        "; location alone does not invalidate a setup.",
    );
    evidence.push(
      alignedGaps.length
        ? alignedGaps.length + " aligned execution imbalance(s) remain incompletely filled."
        : "No qualifying, unfilled execution imbalance aligns with the broader direction.",
    );
    if (zoneReaction) {
      evidence.push("Directional rejection occurred at a fresh or lightly tested price zone.");
    }
    if (invalidation !== null) {
      evidence.push("A close through the protected external swing at " + invalidation + " invalidates that structural reference.");
    }
    if (candle.patterns.length)
      evidence.push("Candle observations: " + candle.patterns.join(", ") + ".");

    return {
      state,
      setupType,
      direction,
      internal: structure,
      external,
      protectedHigh,
      protectedLow,
      weakHigh: external.trend === "bullish" ? (external.swingHigh?.price ?? null) : null,
      weakLow: external.trend === "bearish" ? (external.swingLow?.price ?? null) : null,
      zones,
      candleContext: candle,
      breakout,
      gaps: imbalance.fairValueGaps,
      higherTimeframeGaps,
      calendarLevels,
      location,
      target:
        direction === "bullish"
          ? (liquidity.nearestBuySide?.price ?? null)
          : direction === "bearish"
            ? (liquidity.nearestSellSide?.price ?? null)
            : null,
      invalidation,
      conflicts,
      missing,
      evidence,
      waitFor,
      narrative: [...evidence, ...conflicts, waitFor].join(" "),
      beginnerNarrative:
        "The broader market is " +
        multiTimeframe.context.trend +
        ". " +
        (directionalSweep
          ? "Price moved beyond an established high or low and returned inside it. "
          : "A clear move beyond and back inside an established high or low is not confirmed. ") +
        (conflicts.length
          ? "The evidence disagrees, so waiting is appropriate. "
          : "Candle patterns alone do not confirm a trade. ") +
        waitFor,
    };
  }
}
