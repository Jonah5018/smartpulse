import type {
  TraderWorkspace,
} from "./workspace-types";

export class WorkspaceService {
  /**
   * Determines whether the trader
   * has access to Pulse Intelligence.
   */
  static canUseAI(
    workspace: TraderWorkspace
  ): boolean {
    return workspace.permissions.canUseAI;
  }

  /**
   * Determines whether advanced
   * market analysis is available.
   */
  static canAccessAdvancedMarkets(
    workspace: TraderWorkspace
  ): boolean {
    return (
      workspace.permissions
        .canUseAdvancedMarkets
    );
  }

  /**
   * Determines whether the trader
   * is currently on an active plan.
   */
  static hasActiveSubscription(
    workspace: TraderWorkspace
  ): boolean {
    return (
      workspace.subscription.status ===
        "active" ||
      workspace.subscription.status ===
        "trial"
    );
  }

  /**
   * Feature flag helper.
   */
  static hasFeature(
    workspace: TraderWorkspace,
    feature: keyof TraderWorkspace["featureFlags"]
  ): boolean {
    return workspace.featureFlags[feature];
  }

  /**
   * Convenience helper.
   */
  static isTrial(
    workspace: TraderWorkspace
  ): boolean {
    return (
      workspace.subscription.plan ===
      "trial"
    );
  }
}