import type { TopDownReport } from "@/lib/top-down";

interface Props {
  report: TopDownReport;
}

export function TopDownReportCard({
  report,
}: Props) {
  const verdictColor =
    report.decision === "buy"
      ? "text-emerald-400"
      : report.decision === "sell"
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#07152d] p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
          Top-Down ICT Report
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          {report.symbol}
        </h2>

        <p className="mt-2 text-slate-400">
          Institutional reasoning across H4, H1 and M15.
        </p>
      </div>

      <div className="space-y-4">
        <TimeframeRow
          label="H4 Institutional Bias"
          value={report.higherTimeframe.h4.trend}
          description={report.higherTimeframe.h4.summary}
          color="blue"
        />

        <TimeframeRow
          label="H1 Dealing Range"
          value={report.dealingRange.location}
          description={report.dealingRange.summary}
          color="purple"
        />

        <TimeframeRow
          label="M15 Liquidity"
          value={report.liquidity.narrative.replaceAll("_", " ")}
          description={report.liquidity.summary}
          color="emerald"
        />
      </div>

      <div className="my-6 h-px bg-slate-800" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Institutional Verdict
          </p>

          <h3
            className={`mt-1 text-2xl font-bold uppercase ${verdictColor}`}
          >
            {report.decision}
          </h3>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400">
            Confidence
          </p>

          <p className="text-3xl font-bold text-white">
            {report.confidence}%
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-sm leading-7 text-slate-300">
          {report.narrative}
        </p>
      </div>
    </section>
  );
}

interface RowProps {
  label: string;
  value: string;
  description: string;
  color:
    | "blue"
    | "purple"
    | "emerald";
}

function TimeframeRow({
  label,
  value,
  description,
  color,
}: RowProps) {
  const dot =
    color === "blue"
      ? "bg-blue-500"
      : color === "purple"
      ? "bg-violet-500"
      : "bg-emerald-500";

  return (
    <div className="flex gap-4">
      <div
        className={`mt-2 h-3 w-3 rounded-full ${dot}`}
      />

      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <h4 className="mt-1 text-lg font-semibold capitalize text-white">
          {value}
        </h4>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}