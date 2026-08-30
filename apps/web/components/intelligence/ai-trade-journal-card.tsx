interface Props {
  journal: {
    symbol: string;
    title: string;
    confidence: number;
    state: "ready" | "forming" | "no_setup";
    lesson: string;
    riskPlan: {
      entry: number | null;
      stop: number | null;
      target: number | null;
      rr: number | null;
    };
  };
}

export function AITradeJournalCard({ journal }: Props) {
  const badge =
    journal.state === "ready"
      ? "bg-emerald-500/15 text-emerald-400"
      : journal.state === "forming"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-slate-700 text-slate-300";

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
            AI Trade Journal
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            {journal.symbol}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {journal.title}
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}>
          {journal.state.toUpperCase()}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-950 p-4">
          <p className="text-xs text-slate-500">
            Confidence
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {journal.confidence}%
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 p-4">
          <p className="text-xs text-slate-500">
            Risk Reward
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {journal.riskPlan.rr
              ? `1:${journal.riskPlan.rr}`
              : "--"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 p-4">
        <p className="text-xs uppercase tracking-wide text-blue-400">
          Today's Lesson
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {journal.lesson}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Metric
          label="Entry"
          value={journal.riskPlan.entry}
        />

        <Metric
          label="Stop"
          value={journal.riskPlan.stop}
        />

        <Metric
          label="Target"
          value={journal.riskPlan.target}
        />
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-lg bg-slate-950 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value ?? "--"}
      </p>
    </div>
  );
}