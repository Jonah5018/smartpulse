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

    /* ---------------------------------- */
    /* Market Structure (25)              */
    /* ---------------------------------- */

    if (
      structure.latestEvent === "bos" ||
      structure.latestEvent === "mss"
    ) {
      breakdown.structure = 25;
      score += 25;
      confirmations++;
    } else if (
      structure.latestEvent === "choch"
    ) {
      breakdown.structure = 18;
      score += 18;
      confirmations++;
    }

    /* ---------------------------------- */
    /* Liquidity Sweep (20)               */
    /* ---------------------------------- */

    if (
      liquidity.latestSweep?.detected
    ) {
      breakdown.liquidity = 20;
      score += 20;
      confirmations++;
    }

    /* ---------------------------------- */
    /* Order Block (15)                   */
    /* ---------------------------------- */

    if (orderBlock) {
      breakdown.orderBlock = 15;
      score += 15;
      confirmations++;
    }

    /* ---------------------------------- */
    /* Fair Value Gap (10)                */
    /* ---------------------------------- */

    if (fvg) {
      breakdown.fairValueGap = 10;
      score += 10;
      confirmations++;
    }

    /* ---------------------------------- */
    /* Premium / Discount (10)            */
    /* ---------------------------------- */

    if (
      premiumDiscount.zone ===
      "discount"
    ) {
      breakdown.premiumDiscount = 10;
      score += 10;
      confirmations++;
    } else if (
      premiumDiscount.zone ===
      "premium"
    ) {
      breakdown.premiumDiscount = 8;
      score += 8;
      confirmations++;
    }

    /* ---------------------------------- */
    /* Displacement (20)                  */
    /* ---------------------------------- */

    if (
      displacement.detected
    ) {
      const weighted =
        Math.round(
          (Math.min(
            displacement.strength,
            100
          ) /
            100) *
            20
        );

      breakdown.displacement =
        weighted;

      score += weighted;

      confirmations++;
    }

    score = Math.min(score, 100);

    const grade =
      score >= 90
        ? "A+"
        : score >= 80
        ? "A"
        : score >= 65
        ? "B"
        : "C";

    return {
      score,
      grade,
      confirmations,
      breakdown,
      valid: score >= 65,
    };
  }
}