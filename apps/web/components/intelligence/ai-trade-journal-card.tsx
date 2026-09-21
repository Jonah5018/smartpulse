import type {
  AITradeJournal,
} from "@/lib/trade-journal";

interface Props {
  journal: AITradeJournal;
}

export function AITradeJournalCard({
  journal,
}: Props) {
  const badge =
    journal.state === "ready"
      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
      : journal.state === "forming"
        ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
        : "border-slate-700 bg-slate-800 text-slate-300";

  const confirmedChecks =
    journal.checklist.filter(
      (item) => item.passed
    ).length;

  return (
    <section className="rounded-3xl border border-blue-900/40 bg-gradient-to-br from-blue-950/30 via-slate-950 to-slate-950 p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
            Setup assessment
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              {journal.symbol}
            </h2>

            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>
              {formatState(journal.state)}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-300">
            {journal.title}
          </p>

          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
            {journal.timeframe} execution
            {journal.direction !== "neutral"
              ? ` · ${journal.direction}`
              : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SummaryMetric
            label="Confidence"
            value={`${journal.confidence}%`}
          />

          <SummaryMetric
            label="Checklist"
            value={`${confirmedChecks}/${journal.checklist.length}`}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wide text-blue-300">
            Institutional Narrative
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            {journal.narrative}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-900/40 bg-violet-950/20 p-5">
          <p className="text-xs uppercase tracking-wide text-violet-300">
            Mentor Lesson
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            {journal.lesson}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Evidence Checklist
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Every condition comes from the current institutional analysis.
            </p>
          </div>

          <p className="shrink-0 text-sm font-semibold text-white">
            {confirmedChecks} confirmed
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {journal.checklist.map(
            (item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-200">
                    {item.label}
                  </p>

                  <span
                    className={
                      item.passed
                        ? "shrink-0 whitespace-nowrap rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300"
                        : "shrink-0 whitespace-nowrap rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold text-amber-300"
                    }
                  >
                    {item.passed
                      ? "CONFIRMED"
                      : "WAIT"}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.detail}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Risk Plan
          </p>

          <p className="text-sm font-semibold text-emerald-300">
            {journal.riskPlan.rr !== null
              ? `1:${journal.riskPlan.rr}`
              : "Not available"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PriceMetric
            label="Entry"
            value={journal.riskPlan.entry}
          />

          <PriceMetric
            label="Stop"
            value={journal.riskPlan.stop}
          />

          <PriceMetric
            label="Target"
            value={journal.riskPlan.target}
          />
        </div>

        {journal.riskPlan.rr === null && (
          <p className="mt-4 text-xs leading-5 text-amber-300/80">
            SmartPulse will not invent execution prices. Wait until the analysis defines a complete entry, invalidation, and target.
          </p>
        )}
      </div>

      {journal.warnings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5">
          <p className="text-xs uppercase tracking-wide text-amber-300">Analysis warnings</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-200/80">
            {journal.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-28 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function PriceMetric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {formatPrice(value)}
      </p>
    </div>
  );
}

function formatPrice(
  value: number | null
): string {
  if (value === null) {
    return "Not defined";
  }

  const precision =
    Math.abs(value) >= 100
      ? 2
      : 5;

  return value.toLocaleString(
    "en-US",
    {
      minimumFractionDigits:
        precision === 2 ? 2 : 4,
      maximumFractionDigits: precision,
    }
  );
}

function formatState(
  state: AITradeJournal["state"]
): string {
  return state
    .replaceAll("_", " ")
    .toUpperCase();
}
