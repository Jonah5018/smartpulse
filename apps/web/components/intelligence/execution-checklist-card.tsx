import type { InstitutionalSetup } from "@/lib/institutional-setup";

interface Props {
  setup: InstitutionalSetup;
}

export function ExecutionChecklistCard({
  setup,
}: Props) {
  const checks = [
    {
      label: "Higher-timeframe aligned",
      passed:
        setup.multiTimeframeAlignment ===
        "aligned",
    },
    {
      label: "Liquidity sweep confirmed",
      passed: setup.liquidity.latestSweep !== null,
    },
    {
      label: "Fair Value Gap available",
      passed: setup.entryZone !== null,
    },
    {
      label: "Risk / Reward ≥ 2.0",
      passed:
        (setup.riskReward?.ratio ?? 0) >= 2,
    },
    {
      label: "Institutional confluence valid",
      passed: setup.confluence.valid,
    },
  ];

  const passed =
    checks.filter((c) => c.passed).length;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            Execution Readiness
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Checklist
          </h2>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            Passed
          </p>

          <p className="text-2xl font-bold text-white">
            {passed}/5
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl bg-slate-900/50 px-4 py-3"
          >
            <span className="text-sm text-slate-300">
              {item.label}
            </span>

            {item.passed ? (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                PASS
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">
                WAIT
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          SmartPulse Verdict
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {setup.state === "ready"
            ? "All major institutional conditions have aligned. Execute only according to your predefined risk plan."
            : setup.state === "forming"
            ? "The higher-timeframe narrative exists, but execution confirmation is still developing. Patience is the edge."
            : "No institutional execution is currently justified. Preserve capital and wait for a better opportunity."}
        </p>
      </div>
    </section>
  );
}