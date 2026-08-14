import type {
  FocusScore,
} from "@/lib/focus-score";

interface FocusScoreCardProps {
  focus: FocusScore | null;
}

function priorityLabel(
  priority: FocusScore["priority"]
) {
  switch (priority) {
    case "critical":
      return "Critical Focus";

    case "high":
      return "High Priority";

    case "watch":
      return "On Watch";

    case "low":
      return "Low Priority";

    default:
      return "No Priority";
  }
}

function priorityClass(
  priority: FocusScore["priority"]
) {
  switch (priority) {
    case "critical":
      return "text-red-400 bg-red-500/10 border-red-500/30";

    case "high":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

    case "watch":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";

    case "low":
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";

    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/30";
  }
}

function actionLabel(
  action: FocusScore["action"]
) {
  switch (action) {
    case "review_now":
      return "Review Now";

    case "prepare":
      return "Prepare";

    case "wait":
      return "Wait";

    case "watch":
      return "Keep On Watch";

    case "monitor":
      return "Monitor";

    default:
      return "Ignore";
  }
}

export function FocusScoreCard({
  focus,
}: FocusScoreCardProps) {
  if (!focus) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm uppercase tracking-wider text-slate-500">
          SmartPulse Focus
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          No focus market available
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          SmartPulse does not have enough current
          market information to rank a monitored
          opportunity.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-900/50 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            SmartPulse Primary Focus
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-bold">
              {focus.symbol}
            </h2>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${priorityClass(
                focus.priority
              )}`}
            >
              {priorityLabel(
                focus.priority
              )}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            {focus.reason}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Focus Score
            </p>

            <p className="mt-1 text-5xl font-bold text-blue-400">
              {focus.score}
            </p>

            <p className="text-xs text-slate-500">
              / 100
            </p>
          </div>

          <div className="h-20 w-px bg-slate-800" />

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              SmartPulse Action
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {actionLabel(
                focus.action
              )}
            </p>
          </div>
        </div>
      </div>

      {focus.warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Risk & Context
          </p>

          <ul className="mt-2 space-y-1">
            {focus.warnings.map(
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
    </section>
  );
}