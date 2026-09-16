import type {
  InstitutionalSetup,
  SetupDirection,
  SetupState,
} from "@/lib/institutional-setup";

import type {
  AITradeJournal,
  TradeJournalChecklistItem,
  TradeJournalRiskPlan,
} from "./trade-journal-types";

export class TradeJournalEngine {
  static create(
    setup: InstitutionalSetup
  ): AITradeJournal {
    return {
      symbol: setup.symbol,
      timeframe: setup.executionTimeframe,
      direction: setup.direction,
      state: setup.state,
      confidence:
        this.normalizeConfidence(
          setup.confidence
        ),
      title: this.buildTitle(
        setup.state,
        setup.direction
      ),
      lesson: this.buildLesson(
        setup.state
      ),
      narrative:
        setup.explainability
          .narrative ||
        setup.explanation ||
        setup.summary,
      riskPlan:
        this.buildRiskPlan(setup),
      checklist:
        this.buildChecklist(setup),
      confirmations: [
        ...setup.explainability
          .confirmations,
      ],
      warnings: [
        ...setup.explainability
          .warnings,
      ],
    };
  }

  private static normalizeConfidence(
    confidence: number
  ): number {
    if (!Number.isFinite(confidence)) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(confidence)
      )
    );
  }

  private static buildTitle(
    state: SetupState,
    direction: SetupDirection
  ): string {
    const directionalLabel =
      direction === "neutral"
        ? "Institutional"
        : direction.toUpperCase();

    if (state === "ready") {
      return `${directionalLabel} execution plan is ready`;
    }

    if (state === "forming") {
      return `${directionalLabel} thesis is still forming`;
    }

    return "Stand aside and preserve capital";
  }

  private static buildLesson(
    state: SetupState
  ): string {
    if (state === "ready") {
      return "A high-confluence setup does not remove risk. Execute only inside the defined plan, keep position size disciplined, and accept the invalidation before entering.";
    }

    if (state === "forming") {
      return "The thesis is not yet the trade. Let price complete the institutional sequence before committing capital, because early entry turns analysis into prediction.";
    }

    return "Standing aside is an active professional decision. When structure, liquidity, and execution do not align, preserving capital is the highest-quality trade available.";
  }

  private static buildRiskPlan(
    setup: InstitutionalSetup
  ): TradeJournalRiskPlan {
    const plan = setup.riskReward;

    if (!plan) {
      return {
        entry: null,
        stop: null,
        target: null,
        rr: null,
      };
    }

    return {
      entry: plan.entry,
      stop: plan.stopLoss,
      target: plan.target,
      rr: Number.isFinite(plan.ratio)
        ? Math.round(
            plan.ratio * 100
          ) / 100
        : null,
    };
  }

  private static buildChecklist(
    setup: InstitutionalSetup
  ): TradeJournalChecklistItem[] {
    const structureConfirmed =
      setup.structureEvent !== "none";

    const liquidityConfirmed =
      setup.liquiditySweep !== null ||
      setup.liquidity.latestSweep
        ?.detected === true;

    const expectedDisplacement =
      setup.direction === "buy"
        ? "bullish"
        : setup.direction === "sell"
          ? "bearish"
          : null;

    const displacementConfirmed =
      expectedDisplacement !== null &&
      setup.displacement.detected &&
      setup.displacement.direction ===
        expectedDisplacement;

    const riskReward =
      setup.riskReward?.ratio ?? 0;

    return [
      {
        id: "higher_timeframe_alignment",
        label:
          "Higher-timeframe context aligned",
        passed:
          setup.multiTimeframeAlignment ===
          "aligned",
        detail:
          setup.multiTimeframeAlignment ===
          "aligned"
            ? `${setup.contextTimeframe} context and ${setup.structureTimeframe} structure support the execution direction.`
            : `Current alignment is ${setup.multiTimeframeAlignment.replaceAll("_", " ")}.`,
      },
      {
        id: "structure_confirmation",
        label:
          "Market structure event confirmed",
        passed: structureConfirmed,
        detail: structureConfirmed
          ? `${setup.structureEvent.toUpperCase()} confirms a structural transition.`
          : "No BOS, MSS, or CHOCH is confirmed yet.",
      },
      {
        id: "liquidity_event",
        label:
          "Liquidity event confirmed",
        passed: liquidityConfirmed,
        detail: liquidityConfirmed
          ? "Price has interacted with a mapped liquidity pool."
          : "No qualifying liquidity sweep is confirmed yet.",
      },
      {
        id: "directional_displacement",
        label:
          "Displacement supports direction",
        passed: displacementConfirmed,
        detail: displacementConfirmed
          ? `${setup.displacement.direction} displacement supports the institutional thesis.`
          : "Directional displacement has not confirmed the thesis.",
      },
      {
        id: "entry_imbalance",
        label:
          "Execution imbalance defined",
        passed:
          setup.entryZone !== null &&
          setup.fairValueGap !== null,
        detail:
          setup.entryZone !== null &&
          setup.fairValueGap !== null
            ? "A fair value gap provides a defined execution zone."
            : "Wait for a valid fair value gap and entry zone.",
      },
      {
        id: "risk_reward",
        label:
          "Minimum 1:2 risk-reward available",
        passed: riskReward >= 2,
        detail:
          riskReward >= 2
            ? `The mapped plan offers approximately 1:${Math.round(riskReward * 100) / 100}.`
            : "No qualifying 1:2 risk-reward plan is available.",
      },
    ];
  }
}
