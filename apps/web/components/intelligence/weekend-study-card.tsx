import type { InstitutionalSetup } from "@/lib/institutional-setup";

interface Props {
  setup: InstitutionalSetup;
  symbol: string;
}

export function WeekendStudyCard({
  setup,
  symbol,
}: Props) {
  const directionColor =
    setup.direction === "buy"
      ? "text-emerald-400"
      : setup.direction === "sell"
      ? "text-red-400"
      : "text-slate-300";

  return (
    <section className="rounded-3xl border border-blue-900/40 bg-gradient-to-br from-blue-950/60 to-slate-950 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
            Weekend Study Mode
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {symbol}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Last institutional analysis
          </p>
        </div>

        <div className="rounded-xl bg-blue-500/10 px-3 py-2 text-right">
          <p className="text-xs text-slate-400">
            Confidence
          </p>

          <p className="text-2xl font-bold text-blue-400">
            {setup.confidence}%
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric
          title="Bias"
          value={setup.direction.toUpperCase()}
          color={directionColor}
        />

        <Metric
          title="State"
          value={setup.state.replace("_", " ").toUpperCase()}
        />

        <Metric
          title="Grade"
          value={setup.confluence.grade}
        />
      </div>

      <div className="rounded-2xl bg-slate-900/50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Institutional Narrative
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-200 whitespace-pre-line">
          {setup.explanation}
        </p>
      </div>

      {setup.entryZone && (
        <div className="grid gap-3 md:grid-cols-3">
          <Metric
            title="Entry Low"
            value={setup.entryZone.low.toFixed(5)}
          />

          <Metric
            title="Entry High"
            value={setup.entryZone.high.toFixed(5)}
          />

          <Metric
            title="Midpoint"
            value={setup.entryZone.midpoint.toFixed(5)}
          />
        </div>
      )}

      {setup.riskReward && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            Risk / Reward
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            1 : {setup.riskReward.ratio}
          </p>
        </div>
      )}
    </section>
  );
}

function Metric({
  title,
  value,
  color = "text-white",
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className={`mt-2 text-lg font-semibold ${color}`}>
        {value}
      </p>
    </div>
  );
}