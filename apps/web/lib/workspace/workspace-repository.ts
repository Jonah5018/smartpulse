import { createClient } from "@/lib/supabase/server";

import { ProfileRepository } from "@/lib/profiles/profile-repository";

import type {
  TraderWorkspace,
  WorkspaceFeatureFlags,
  WorkspacePermissions,
  WorkspaceSubscription,
} from "./workspace-types";

export class WorkspaceRepository {
  static async load(
    authUserId: string
  ): Promise<TraderWorkspace | null> {
    const client = await createClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return null;
    }

    const profile =
      await ProfileRepository.findById(
        client,
        authUserId
      );

    if (!profile) {
      return null;
    }

    /**
     * Temporary implementation.
     *
     * These will eventually come from dedicated
     * tables once subscriptions, permissions,
     * and feature flags are introduced.
     */

    const subscription: WorkspaceSubscription =
      {
        plan: "trial",
        status: "trial",
      };

    const permissions: WorkspacePermissions =
      {
        canUseAI: true,
        canExportJournal: false,
        canAccessAnalytics: true,
        canUseAdvancedMarkets: false,
      };

    const featureFlags: WorkspaceFeatureFlags =
      {
        pulseIntelligence: true,
        tradingJournal: true,
        economicCalendar: true,
        aiCoach: false,
        brokerIntegration: false,
      };

    return {
      user,
      profile,
      subscription,
      permissions,
      featureFlags,
    };
  }
}