import type {
  OpportunityDecision,
} from "@/lib/decision";

interface DecisionCardProps {
  symbol: string;
  decision:
    | OpportunityDecision
    | undefined;
}

function stateLabel(
  state: OpportunityDecision["state"]
) {
  switch (state) {
    case "confirmed":
      return "Confirmed";

    case "ready":
      return "Ready";

    case "forming":
      return "Forming";

    case "discovered":
      return "Discovered";

    case "active":
      return "Active";

    case "completed":
      return "Completed";

    case "invalidated":
      return "Invalidated";

    default:
      return "Unknown";
  }
}

function stateClass(
  state: OpportunityDecision["state"]
) {
  switch (state) {
    case "confirmed":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

    case "ready":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";

    case "forming":
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";

    case "invalidated":
      return "text-red-400 bg-red-500/10 border-red-500/30";

    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/30";
  }
}

function actionLabel(
  action: OpportunityDecision["action"]
) {
  switch (action) {
    case "observe":
      return "Observe";

    case "monitor":
      return "Monitor";

    case "wait_for_entry":
      return "Wait for Entry";

    case "prepare":
      return "Prepare";

    case "confirm":
      return "Confirm";

    case "manage":
      return "Manage";

    case "stand_aside":
      return "Stand Aside";

    default:
      return "Observe";
  }
}

export function DecisionCard({
  symbol,
  decision,
}: DecisionCardProps) {
  if (!decision) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-blue-500">
          SmartPulse Decision
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          {symbol}
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          Decision intelligence is currently unavailable.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-blue-500">
            SmartPulse Decision
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold">
              {symbol}
            </h2>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${stateClass(
                decision.state
              )}`}
            >
              {stateLabel(
                decision.state
              )}
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
            {decision.message}
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-slate-800 bg-slate-950/70 p-4 lg:min-w-48">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Next Action
          </p>

          <p className="mt-2 text-lg font-semibold text-white">
            {actionLabel(
              decision.action
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Confidence: {decision.confidence}%
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-xs uppercase tracking-wider text-blue-400">
          What SmartPulse recommends next
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          {decision.nextAction}
        </p>
      </div>

      {decision.warnings.length >
        0 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Decision Warnings
          </p>

          <ul className="mt-2 space-y-2">
            {decision.warnings.map(
              (warning) => (
                <li
                  key={warning}
                  className="text-sm text-slate-400"
                >
                  • {warning}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">
            Setup Quality
          </p>

          <p className="mt-1 text-sm font-medium capitalize">
            {decision.setupQuality}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            MTF Alignment
          </p>

          <p className="mt-1 text-sm font-medium capitalize">
            {decision.multiTimeframeAlignment.replace(
              "_",
              " "
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Liquidity Sweep
          </p>

          <p className="mt-1 text-sm font-medium">
            {decision.hasLiquiditySweep
              ? "Confirmed"
              : "Not confirmed"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Risk / Reward
          </p>

          <p className="mt-1 text-sm font-medium">
            {decision.riskRewardRatio !==
            null
              ? `${decision.riskRewardRatio}`
              : "Not defined"}
          </p>
        </div>
      </div>
    </section>
  );
}