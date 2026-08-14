import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  OpportunityDecision,
  DecisionAction,
  DecisionPriority,
  DecisionState,
} from "./decision-types";


export class DecisionEngine {
  static evaluate(
    setup: InstitutionalSetup
  ): OpportunityDecision {
    const warnings =
      this.buildWarnings(setup);

    const state =
      this.determineState(setup);

    const priority =
      this.determinePriority(
        setup,
        state
      );

    const action =
      this.determineAction(
        setup,
        state
      );

    const message =
      this.buildMessage(
        setup,
        state,
        action
      );

    const nextAction =
      this.buildNextAction(action);

    return {
      state,

      priority,

      confidence:
        setup.confidence,

      message,

      nextAction,

      action,

      setupState:
        setup.state,

      setupQuality:
        setup.quality,

      setupContext:
        setup.setupContext,

      multiTimeframeAlignment:
        setup.multiTimeframeAlignment,

      hasLiquiditySweep:
        setup.liquiditySweep !==
        null,

      hasDisplacement:
        setup.displacement !==
        null,

      hasFairValueGap:
        setup.fairValueGap !==
        null,

      hasEntryZone:
        setup.entryZone !==
        null,

      hasRiskRewardPlan:
        setup.riskReward !==
        null,

      riskRewardRatio:
        setup.riskReward?.ratio ??
        null,

      warnings,
    };
  }


  private static determineState(
    setup: InstitutionalSetup
  ): DecisionState {
    /*
     * No institutional setup exists.
     */
    if (
      setup.state ===
      "no_setup"
    ) {
      return "discovered";
    }


    /*
     * The setup exists but is still
     * developing.
     */
    if (
      setup.state ===
      "forming"
    ) {
      return "forming";
    }


    /*
     * A ready setup does NOT automatically
     * become confirmed.
     *
     * Confirmation requires actual
     * execution evidence.
     */
    if (
      setup.state ===
      "ready"
    ) {
      if (
        this.isExecutionConfirmed(
          setup
        )
      ) {
        return "confirmed";
      }

      return "ready";
    }


    return "forming";
  }


  private static isExecutionConfirmed(
    setup: InstitutionalSetup
  ): boolean {
    /*
     * Execution confirmation requires:
     *
     * - A defined entry zone
     * - Directional displacement
     * - A complete risk/reward plan
     * - At least 2:1 R:R
     *
     * This prevents:
     *
     * confidence >= 90
     *        ↓
     * automatic confirmation
     */
    return (
      setup.entryZone !==
        null &&
      setup.displacement !==
        null &&
      setup.riskReward !==
        null &&
      setup.riskReward.ratio >=
        2
    );
  }


  private static determinePriority(
    setup: InstitutionalSetup,
    state: DecisionState
  ): DecisionPriority {
    /*
     * Completed or invalidated setups
     * should not receive active attention.
     */
    if (
      state ===
        "invalidated" ||
      state ===
        "completed"
    ) {
      return "low";
    }


    /*
     * Countertrend setups are downgraded
     * even when technical evidence exists.
     */
    if (
      setup.multiTimeframeAlignment ===
      "countertrend"
    ) {
      return "medium";
    }


    /*
     * Confirmed exceptional setups deserve
     * the highest attention level.
     */
    if (
      state === "confirmed" &&
      setup.quality ===
        "exceptional"
    ) {
      return "critical";
    }


    /*
     * Exceptional setups remain highly
     * important even before confirmation.
     */
    if (
      setup.quality ===
      "exceptional"
    ) {
      return "high";
    }


    /*
     * Confirmed high-quality setups.
     */
    if (
      state === "confirmed" &&
      setup.quality ===
        "high"
    ) {
      return "high";
    }


    /*
     * Ready high-quality setups deserve
     * close attention.
     */
    if (
      state === "ready" &&
      setup.quality ===
        "high"
    ) {
      return "high";
    }


    /*
     * Developing setups remain medium
     * priority until stronger evidence exists.
     */
    if (
      setup.state ===
      "forming"
    ) {
      return "medium";
    }


    return "low";
  }


  private static determineAction(
    setup: InstitutionalSetup,
    state: DecisionState
  ): DecisionAction {
    /*
     * No setup means observe.
     */
    if (
      setup.state ===
      "no_setup"
    ) {
      return "observe";
    }


    /*
     * Unclear context means stand aside.
     */
    if (
      setup.setupContext ===
      "unclear"
    ) {
      return "stand_aside";
    }


    /*
     * Countertrend setups should not
     * immediately progress toward execution.
     */
    if (
      setup.multiTimeframeAlignment ===
      "countertrend"
    ) {
      return "stand_aside";
    }


    /*
     * Confirmed execution conditions.
     */
    if (
      state ===
      "confirmed"
    ) {
      return "confirm";
    }


    /*
     * Ready but not yet confirmed.
     */
    if (
      state ===
      "ready"
    ) {
      if (
        setup.entryZone ===
        null
      ) {
        return "wait_for_entry";
      }

      return "prepare";
    }


    /*
     * Forming setup.
     */
    if (
      state ===
      "forming"
    ) {
      return "monitor";
    }


    return "observe";
  }


  private static buildMessage(
    setup: InstitutionalSetup,
    state: DecisionState,
    action: DecisionAction
  ): string {
    /*
     * No setup.
     */
    if (
      setup.state ===
      "no_setup"
    ) {
      return (
        `${setup.symbol} does not currently have a valid institutional setup.`
      );
    }


    /*
     * Range context is context, not
     * automatic invalidation.
     */
    if (
      setup.setupContext ===
      "inside_range"
    ) {
      return (
        `${setup.symbol} has a developing ${setup.direction} opportunity inside a broader range. The range is context, not an automatic invalidation.`
      );
    }


    /*
     * Countertrend context.
     */
    if (
      setup.multiTimeframeAlignment ===
      "countertrend"
    ) {
      return (
        `${setup.symbol} has a technically interesting setup, but it is countertrend to the configured higher-timeframe context.`
      );
    }


    /*
     * Confirmed execution setup.
     */
    if (
      state ===
      "confirmed"
    ) {
      return (
        `${setup.symbol} has satisfied the current execution confirmation requirements.`
      );
    }


    /*
     * Ready but still awaiting execution.
     */
    if (
      state ===
      "ready"
    ) {
      return (
        `${setup.symbol} has a high-quality institutional setup, but execution confirmation is still required.`
      );
    }


    /*
     * Default forming state.
     */
    return (
      `${setup.symbol} has a developing institutional setup. SmartPulse is monitoring for additional confirmation.`
    );
  }


  private static buildNextAction(
    action: DecisionAction
  ): string {
    switch (
      action
    ) {
      case "observe":
        return (
          "Observe price action and wait for a valid institutional setup."
        );


      case "monitor":
        return (
          "Monitor the setup for displacement, liquidity confirmation and a valid entry area."
        );


      case "wait_for_entry":
        return (
          "Wait for price to reach the defined entry area and confirm the execution trigger."
        );


      case "prepare":
        return (
          "Prepare the trade plan, but do not enter until execution confirmation is present."
        );


      case "confirm":
        return (
          "Execution conditions are currently confirmed. Validate risk and execution before entering."
        );


      case "manage":
        return (
          "Manage the active position according to the defined invalidation and target."
        );


      case "stand_aside":
        return (
          "Stand aside until market context and setup alignment improve."
        );


      default:
        return (
          "Continue monitoring the market."
        );
    }
  }


  private static buildWarnings(
    setup: InstitutionalSetup
  ): string[] {
    const warnings: string[] =
      [];


    if (
      setup.setupContext ===
      "inside_range"
    ) {
      warnings.push(
        "The setup is developing inside a broader range."
      );
    }


    if (
      setup.setupContext ===
      "countertrend"
    ) {
      warnings.push(
        "The setup is countertrend to the configured market context."
      );
    }


    if (
      setup.multiTimeframeAlignment ===
      "countertrend"
    ) {
      warnings.push(
        "Lower-timeframe direction conflicts with the higher-timeframe context."
      );
    }


    if (
      setup.entryZone ===
      null
    ) {
      warnings.push(
        "No validated entry zone is currently available."
      );
    }


    if (
      setup.displacement ===
      null
    ) {
      warnings.push(
        "Directional displacement has not yet been confirmed."
      );
    }


    if (
      setup.fairValueGap ===
      null
    ) {
      warnings.push(
        "No validated fair value gap is currently available."
      );
    }


    if (
      setup.riskReward ===
      null
    ) {
      warnings.push(
        "No complete risk/reward plan is currently available."
      );
    } else if (
      setup.riskReward.ratio <
      2
    ) {
      warnings.push(
        `Current risk/reward is ${setup.riskReward.ratio}:1, below the preferred 2:1 threshold.`
      );
    }


    return warnings;
  }
}