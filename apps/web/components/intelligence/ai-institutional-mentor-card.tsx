import type { InstitutionalSetup } from "@/lib/institutional-setup";

interface Props {
  setup: InstitutionalSetup;
}

export function AIInstitutionalMentorCard({
  setup,
}: Props) {
  const confirmations = [
    setup.structureEvent !== "none"
      ? `Market structure confirmed (${setup.structureEvent.toUpperCase()})`
      : null,

    setup.liquidity.latestSweep
      ? "Liquidity sweep confirmed"
      : null,

    setup.entryZone
      ? "Fair Value Gap available"
      : null,

    setup.multiTimeframeAlignment === "aligned"
      ? "Higher-timeframe alignment"
      : null,
  ].filter(Boolean);

  const invalidations = [
    setup.direction === "buy"
      ? "H1 closes below structural swing low"
      : setup.direction === "sell"
      ? "H1 closes above structural swing high"
      : "No directional setup",

    setup.entryZone
      ? "FVG becomes fully mitigated"
      : "Wait for imbalance creation",
  ];

  return (
    <section className="rounded-3xl border border-violet-900/40 bg-gradient-to-br from-violet-950/40 to-slate-950 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
          🧠
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-violet-400">
            AI Institutional Mentor
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Why this setup exists
          </h2>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/60 p-5">
        <p className="text-sm leading-7 text-slate-200 whitespace-pre-line">
          {setup.explanation}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            What confirms the idea
          </p>

          <div className="mt-3 space-y-2">
            {confirmations.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2"
              >
                <span className="mt-1 text-emerald-400">
                  ✓
                </span>

                <span className="text-sm text-slate-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-300">
            What invalidates it
          </p>

          <div className="mt-3 space-y-2">
            {invalidations.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2"
              >
                <span className="mt-1 text-amber-400">
                  !
                </span>

                <span className="text-sm text-slate-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          SmartPulse Coaching Note
        </p>

        <p className="mt-2 text-sm leading-7 text-slate-300">
          {setup.state === "ready"
            ? "A READY setup is not permission to risk more. It simply means the institutional conditions have aligned. Position sizing and risk management remain your edge."
            : setup.state === "forming"
            ? "FORMING is often where inexperienced traders lose money by entering too early. Let price complete the sequence before acting."
            : "NO SETUP is a valid decision. Professional traders preserve capital when the market offers no statistical edge."}
        </p>
      </div>
    </section>
  );
}