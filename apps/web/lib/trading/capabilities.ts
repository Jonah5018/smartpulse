import type { EffectivePlan } from "@/lib/billing/entitlement";
import type { ExecutionMode } from "./types";

export function tradingCapabilities(plan: EffectivePlan) {
  const pro = plan === "pro" || plan === "elite";
  return {
    brokerConnection: pro,
    paperTrading: pro,
    manualExecution: pro,
    semiAutoExecution: pro,
    autoExecution: plan === "elite",
    advancedRiskControls: plan === "elite",
    portfolioAutomation: plan === "elite",
  };
}
export function modeEntitled(plan: EffectivePlan, mode: ExecutionMode) {
  const c = tradingCapabilities(plan);
  return (
    mode === "analysis" ||
    (mode === "paper"
      ? c.paperTrading
      : mode === "manual"
        ? c.manualExecution
        : mode === "semi_auto"
          ? c.semiAutoExecution
          : c.autoExecution)
  );
}
