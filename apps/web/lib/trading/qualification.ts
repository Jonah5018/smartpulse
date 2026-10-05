import type { InstitutionalSetup } from "@/lib/institutional-setup/institutional-setup-types";
export type QualificationState =
  | "no_setup"
  | "observation"
  | "developing"
  | "waiting_confirmation"
  | "qualified"
  | "rejected"
  | "expired"
  | "invalidated"
  | "insufficient_data";

export function qualifySetup(
  setup: InstitutionalSetup | null,
  generatedAt: string | null,
  now = Date.now(),
): { state: QualificationState; reasons: string[] } {
  if (!setup?.priceAction || !generatedAt)
    return {
      state: "insufficient_data",
      reasons: ["Structured price-action evidence is unavailable."],
    };
  const age = now - Date.parse(generatedAt);
  if (!Number.isFinite(age) || age < 0 || age > 120_000)
    return {
      state: "expired",
      reasons: ["Analysis is not fresh enough for execution."],
    };
  const apa = setup.priceAction;
  if (apa.state === "invalid_setup")
    return {
      state: "invalidated",
      reasons: ["The setup has been invalidated."],
    };
  if (apa.state === "insufficient_data")
    return {
      state: "insufficient_data",
      reasons: ["Required market evidence is incomplete."],
    };
  if (setup.state === "no_setup" || apa.state === "no_trade")
    return { state: "no_setup", reasons: ["No qualified setup."] };
  if (apa.state === "observation")
    return {
      state: "observation",
      reasons: ["Observation is not confirmation."],
    };
  if (apa.state === "potential_setup" || apa.state === "developing_setup")
    return {
      state: "developing",
      reasons: ["Price-action confirmation is still developing."],
    };
  const reasons: string[] = [];
  const p = setup.riskReward;
  if (setup.state !== "ready" || apa.state !== "confirmed_setup")
    reasons.push("Execution confirmation is incomplete.");
  if (setup.multiTimeframeAlignment !== "aligned" || apa.conflicts.length)
    reasons.push("Timeframe context conflicts or is not aligned.");
  if (
    !setup.entryZone ||
    setup.invalidation === null ||
    !p ||
    ![p.entry, p.stopLoss, p.target, p.ratio].every(
      (n) => Number.isFinite(n) && n > 0,
    ) ||
    p.ratio < 2
  )
    reasons.push(
      "A complete protected trade plan with at least 2R is required.",
    );
  if (
    setup.direction === "neutral" ||
    !setup.confluence.valid ||
    !["high", "exceptional"].includes(setup.quality)
  )
    reasons.push("Mandatory structured confirmations are missing.");
  if (p && setup.direction !== "neutral") {
    const sign = setup.direction === "buy" ? 1 : -1;
    if ((p.entry - p.stopLoss) * sign <= 0 || (p.target - p.entry) * sign <= 0)
      reasons.push("Invalid stop or target direction.");
  }
  return { state: reasons.length ? "rejected" : "qualified", reasons };
}
