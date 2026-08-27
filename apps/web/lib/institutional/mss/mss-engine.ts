import type {
  MarketStructure,
} from "@/lib/institutional/market-structure";

import type {
  LiquidityMap,
} from "@/lib/institutional/liquidity";

import type {
  MarketStructureShift,
} from "./mss-types";

import { MSSUtils } from "./mss-utils";

export class MSSEngine {
  static analyze(
    structure: MarketStructure,
    liquidity: LiquidityMap
  ): MarketStructureShift {
    const sweepDetected = Boolean(
      (liquidity as unknown as { sweep?: { detected?: boolean } }).sweep
        ?.detected
    );

    if (
      structure.trend === "bearish" &&
      structure.choch.detected &&
      structure.choch.direction === "bullish"
    ) {
      return {
        detected: true,
        direction: "bullish",
        price: structure.choch.price,
        candleIndex:
          structure.choch.candleIndex,
        confidence: MSSUtils.confidence(
          true,
          sweepDetected
        ),
      };
    }

    if (
      structure.trend === "bullish" &&
      structure.choch.detected &&
      structure.choch.direction === "bearish"
    ) {
      return {
        detected: true,
        direction: "bearish",
        price: structure.choch.price,
        candleIndex:
          structure.choch.candleIndex,
        confidence: MSSUtils.confidence(
          true,
          sweepDetected
        ),
      };
    }

    return {
      detected: false,
      direction: null,
      price: null,
      candleIndex: null,
      confidence: 0,
    };
  }
}