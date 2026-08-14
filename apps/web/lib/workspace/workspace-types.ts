import type { User } from "@supabase/supabase-js";

import type { TraderProfile } from "@/lib/profiles";

export interface WorkspaceSubscription {
  plan: "trial" | "starter" | "pro" | "elite";

  status:
    | "active"
    | "trial"
    | "expired"
    | "cancelled";
}

export interface WorkspacePermissions {
  canUseAI: boolean;

  canExportJournal: boolean;

  canAccessAnalytics: boolean;

  canUseAdvancedMarkets: boolean;
}

export interface WorkspaceFeatureFlags {
  pulseIntelligence: boolean;

  tradingJournal: boolean;

  economicCalendar: boolean;

  aiCoach: boolean;

  brokerIntegration: boolean;
}

export interface TraderWorkspace {
  user: User;

  profile: TraderProfile;

  subscription: WorkspaceSubscription;

  permissions: WorkspacePermissions;

  featureFlags: WorkspaceFeatureFlags;
}