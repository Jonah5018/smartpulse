import type {
  MarketStructureAnalysis,
} from "@/lib/market-structure";

import type {
  LiquidityMap,
} from "@/lib/institutional/liquidity";

import type {
  OrderBlock,
} from "@/lib/institutional/order-block";

import type {
  FairValueGap,
} from "@/lib/imbalance";

import type {
  PremiumDiscountArray,
} from "@/lib/institutional/premium-discount";

import type {
  Displacement,
} from "@/lib/institutional/displacement";

import type {
  ConfluenceResult,
} from "./confluence-types";

export class ConfluenceEngine {
  static evaluate(
    structure: MarketStructureAnalysis,
    liquidity: LiquidityMap,
    orderBlock: OrderBlock | null,
    fvg: FairValueGap | null,
    premiumDiscount: PremiumDiscountArray,
    displacement: Displacement
  ): ConfluenceResult {
    let score = 0;
    let confirmations = 0;

    const breakdown = {
      structure: 0,
      liquidity: 0,
      orderBlock: 0,
      fairValueGap: 0,
      premiumDiscount: 0,
      displacement: 0,
    };

    // 20
    if (
      structure.latestEvent === "bos" ||
      structure.latestEvent === "mss" ||
      structure.latestEvent === "choch"
    ) {
      breakdown.structure = 20;
      score += 20;
      confirmations++;
    }

    // 20
    if (liquidity.latestSweep?.detected) {
      breakdown.liquidity = 20;
      score += 20;
      confirmations++;
    }

    // 15
    if (orderBlock) {
      breakdown.orderBlock = 15;
      score += 15;
      confirmations++;
    }

    // 10
    if (fvg) {
      breakdown.fairValueGap = 10;
      score += 10;
      confirmations++;
    }

    // 5
    if (
      premiumDiscount.zone !==
      "equilibrium"
    ) {
      breakdown.premiumDiscount = 5;
      score += 5;
      confirmations++;
    }

    // 30
    if (displacement.detected) {
      const bonus = Math.round(
        (displacement.strength / 100) * 30
      );

      breakdown.displacement = bonus;
      score += bonus;
      confirmations++;
    }

    const grade =
      score >= 90
        ? "A+"
        : score >= 75
        ? "A"
        : score >= 55
        ? "B"
        : "C";

    return {
      score: Math.min(score, 100),
      grade,
      confirmations,
      breakdown,
      valid: score >= 55,
    };
  }
}