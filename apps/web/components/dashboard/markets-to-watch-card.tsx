import type {
  FocusScore,
} from "@/lib/focus-score";

interface MarketsToWatchCardProps {
  focusScores: FocusScore[];
}

function priorityClass(
  priority: FocusScore["priority"]
) {
  switch (priority) {
    case "critical":
      return "text-red-400";

    case "high":
      return "text-emerald-400";

    case "watch":
      return "text-blue-400";

    case "low":
      return "text-amber-400";

    default:
      return "text-slate-500";
  }
}

function actionLabel(
  action: FocusScore["action"]
) {
  switch (action) {
    case "review_now":
      return "Review now";

    case "prepare":
      return "Prepare";

    case "wait":
      return "Wait";

    case "watch":
      return "Watch";

    case "monitor":
      return "Monitor";

    default:
      return "Ignore";
  }
}

function factorLabel(
  key: string
) {
  switch (key) {
    case "opportunity":
      return "Opportunity";

    case "setupReadiness":
      return "Setup Readiness";

    case "multiTimeframeAlignment":
      return "MTF Alignment";

    case "liquidity":
      return "Liquidity";

    case "displacement":
      return "Structure";

    case "entryQuality":
      return "Entry Quality";

    case "riskReward":
      return "Risk / Reward";

    case "sessionQuality":
      return "Session";

    case "calendarRisk":
      return "Calendar Risk";

    default:
      return key;
  }
}

export function MarketsToWatchCard({
  focusScores,
}: MarketsToWatchCardProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-blue-500">
            Market Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Markets to Watch
          </h2>
        </div>

        <span className="text-xs text-slate-500">
          Ranked by Focus Score
        </span>
      </div>

      <div className="mt-6 divide-y divide-slate-800">
        {focusScores.map(
          (focus, index) => {
            const factors =
              Object.entries(
                focus.factors
              );

            return (
              <details
                key={focus.symbol}
                className="group py-5"
              >
                <summary className="flex cursor-pointer list-none flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-400">
                      {index + 1}
                    </span>

                    <div>
                      <p className="font-semibold">
                        {focus.symbol}
                      </p>

                      <p
                        className={`mt-1 text-xs font-medium uppercase tracking-wider ${priorityClass(
                          focus.priority
                        )}`}
                      >
                        {focus.priority}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Focus
                      </p>

                      <p className="text-2xl font-bold text-blue-400">
                        {focus.score}
                      </p>
                    </div>

                    <div className="min-w-24 text-right">
                      <p className="text-xs text-slate-500">
                        Action
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-300">
                        {actionLabel(
                          focus.action
                        )}
                      </p>
                    </div>

                    <span className="text-slate-500 transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </div>
                </summary>

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Why SmartPulse ranked this market
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {focus.reason}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Score Factors
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {factors.map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-slate-500">
                                {factorLabel(
                                  key
                                )}
                              </span>

                              <span className="text-sm font-semibold text-slate-200">
                                {value}
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      value
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {focus.warnings.length >
                    0 && (
                    <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Warnings
                      </p>

                      <ul className="mt-2 space-y-2">
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

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Direction
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize">
                        {focus.opportunity.direction}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Structure
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {focus.opportunity.structure}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        HTF Bias
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize">
                        {
                          focus.opportunity
                            .higherTimeframeBias
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </details>
            );
          }
        )}

        {focusScores.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">
              No monitored markets are currently available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}