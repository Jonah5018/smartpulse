import type {
  MarketStructure,
} from "@/lib/institutional/market-structure";

import type {
  LiquidityMap,
} from "@/lib/institutional/liquidity";

import type {
  OrderBlock,
} from "@/lib/institutional/order-block";

import type {
  Displacement,
} from "@/lib/institutional/displacement";

import type {
  ConfluenceResult,
} from "@/lib/institutional/confluence";

import type {
  InstitutionalExplanation,
} from "./explainability-types";

export class ExplainabilityEngine {
  static generate(
    confluence: ConfluenceResult,
    structure: MarketStructure,
    liquidity: LiquidityMap,
    orderBlock: OrderBlock | null,
    fvg: unknown | null,
    displacement: Displacement
  ): InstitutionalExplanation {
    const confirmations: string[] = [];
    const warnings: string[] = [];

    if (structure.bos.detected) {
      confirmations.push(
        `Break of Structure confirms ${structure.bos.direction} continuation.`
      );
    }

    if (orderBlock) {
      confirmations.push(
        "Price is reacting from a valid institutional order block."
      );
    }

    if (fvg) {
      confirmations.push(
        "Fair Value Gap provides an institutional re-entry zone."
      );
    }

    if (displacement.detected) {
      confirmations.push(
        `Strong ${displacement.direction} displacement confirms institutional momentum.`
      );
    }

    if (confluence.score < 75) {
      warnings.push(
        "Confluence is moderate; wait for additional confirmation."
      );
    }

    const headline =
      confluence.grade === "A+"
        ? "Exceptional institutional continuation setup"
        : confluence.grade === "A"
        ? "High-quality institutional setup"
        : confluence.grade === "B"
        ? "Moderate institutional setup"
        : "Weak institutional context";

    const narrative = this.buildNarrative(
      structure,
      liquidity,
      orderBlock,
      displacement
    );

    return {
      headline,
      narrative,
      confirmations,
      warnings,
    };
  }

  private static buildNarrative(
    structure: MarketStructure,
    liquidity: LiquidityMap,
    orderBlock: OrderBlock | null,
    displacement: Displacement
  ): string {
    const trend =
      structure.trend === "bullish"
        ? "bullish"
        : structure.trend === "bearish"
        ? "bearish"
        : "ranging";

    const ob =
      orderBlock
        ? "institutional order block"
        : "no nearby order block";

    const impulse =
      displacement.detected
        ? "strong displacement confirms institutional participation"
        : "displacement remains weak";

    return `Higher-timeframe structure remains ${trend}. Price is interacting with ${ob}. The latest impulse shows ${impulse}.`;
  }
}