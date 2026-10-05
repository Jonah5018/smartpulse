import type { EffectivePlan } from "@/lib/billing/entitlement";
import { modeEntitled } from "./capabilities";
import type { ExecutionMode } from "./types";

export interface PolicyInput {
  plan: EffectivePlan;
  mode: ExecutionMode;
  enabled: boolean;
  globalEnabled: boolean;
  userStopped: boolean;
  accountStopped: boolean;
  brokerEnabled: boolean;
  connectionHealthy: boolean;
  instrumentAllowed: boolean;
  marketOpen: boolean;
  sessionAllowed: boolean;
  newsVerified: boolean;
  newsBlocked: boolean;
  riskApproved: boolean;
  qualified: boolean;
  approvedByUser: boolean;
  duplicate: boolean;
}
export function executionPolicy(input: PolicyInput): string[] {
  const reasons: string[] = [];
  if (!modeEntitled(input.plan, input.mode))
    reasons.push("Subscription does not permit this mode.");
  if (input.mode === "analysis")
    reasons.push("Analysis-only mode does not submit orders.");
  if (input.mode !== "paper")
    reasons.push("Broker order execution is not enabled in this release.");
  if (
    !input.globalEnabled ||
    !input.enabled ||
    input.userStopped ||
    input.accountStopped ||
    !input.brokerEnabled
  )
    reasons.push("New entries are disabled.");
  if (!input.connectionHealthy)
    reasons.push("Account connection is unhealthy.");
  if (!input.instrumentAllowed || !input.marketOpen || !input.sessionAllowed)
    reasons.push("Market or session is not permitted.");
  if (!input.newsVerified || input.newsBlocked)
    reasons.push("Economic-event protection is blocked or unverified.");
  if (!input.qualified || !input.riskApproved)
    reasons.push("Setup or risk approval is missing.");
  if (!input.approvedByUser)
    reasons.push("Explicit paper-trade approval is required.");
  if (input.duplicate) reasons.push("This setup has already been submitted.");
  return reasons;
}

export function inNewsWindow(
  events: { time: string; highImpact: boolean }[],
  now: number,
  beforeMinutes = 30,
  afterMinutes = 30,
) {
  if (
    !Number.isFinite(now) ||
    !Number.isFinite(beforeMinutes) ||
    !Number.isFinite(afterMinutes) ||
    beforeMinutes < 0 ||
    afterMinutes < 0
  )
    return true;
  return events.some((event) => {
    const time = Date.parse(event.time);
    return (
      event.highImpact &&
      (!Number.isFinite(time) ||
        (now >= time - beforeMinutes * 60_000 &&
          now <= time + afterMinutes * 60_000))
    );
  });
}
