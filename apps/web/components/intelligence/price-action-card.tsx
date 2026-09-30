import type { PriceActionAnalysis } from "@/lib/price-action/price-action-types";

interface Props {
  analysis: PriceActionAnalysis;
  beginner: boolean;
}

export function PriceActionCard({ analysis, beginner }: Props) {
  return (
    <section className="sp-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sp-eyebrow">Structure, location and confirmation</p>
          <h3 className="mt-2 text-xl font-semibold">Price action context</h3>
        </div>
        <span className="sp-badge">{analysis.state.replaceAll("_", " ")}</span>
      </div>

      <p className="text-sm leading-7 text-slate-300">
        {beginner ? analysis.beginnerNarrative : analysis.narrative}
      </p>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Setup context</dt>
          <dd className="mt-1 capitalize">{analysis.setupType.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Location</dt>
          <dd className="mt-1 capitalize">{analysis.location}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Breakout evidence</dt>
          <dd className="mt-1 capitalize">
            {analysis.breakout.state.replaceAll("_", " ")}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Candle behaviour</dt>
          <dd className="mt-1 capitalize">{analysis.candleContext.phase}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Target liquidity</dt>
          <dd className="mt-1">{analysis.target ?? "Not established"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">External structural invalidation</dt>
          <dd className="mt-1">{analysis.invalidation ?? "Not established"}</dd>
        </div>
      </dl>

      {analysis.zones.length > 0 && (
        <details className="sp-disclosure">
          <summary>Key price zones</summary>
          <ul className="space-y-3 p-4 text-sm">
            {analysis.zones.slice(-12).map((zone, index) => (
              <li key={zone.timeframe + zone.formedAt + zone.kind + index}>
                <span className="font-medium capitalize">
                  {zone.timeframe} {zone.kind}
                </span>
                <p className="mt-1 text-slate-400">
                  {zone.low.toPrecision(6)}–{zone.high.toPrecision(6)} · {zone.status} ·{" "}
                  {zone.retests} retests
                </p>
                {zone.roleReversal && (
                  <p className="text-slate-400">
                    Broken level revisited; watch for role reversal.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {(analysis.calendarLevels.length > 0 ||
        analysis.higherTimeframeGaps.length > 0) && (
        <details className="sp-disclosure">
          <summary>Calendar levels and higher timeframe imbalances</summary>
          <ul className="space-y-3 p-4 text-sm text-slate-400">
            {analysis.calendarLevels.map((level) => (
              <li key={level.period}>
                <span className="capitalize">
                  {level.period.replaceAll("_", " ")} (UTC)
                </span>
                {" · "}High {level.high.toPrecision(6)} · Low {level.low.toPrecision(6)}
              </li>
            ))}
            {analysis.higherTimeframeGaps
              .filter((gap) => !gap.isMitigated)
              .slice(-6)
              .map((gap) => (
                <li key={gap.timeframe + gap.timestamp + gap.direction}>
                  {gap.timeframe} {gap.direction} imbalance: {gap.low.toPrecision(6)}–
                  {gap.high.toPrecision(6)}
                  {" · "}
                  {gap.mitigationPercent}% filled
                </li>
              ))}
          </ul>
        </details>
      )}

      {analysis.conflicts.length > 0 && (
        <div className="sp-notice">
          <p className="font-medium">Conflicting evidence</p>
          <ul className="mt-2 list-inside list-disc space-y-2">
            {analysis.conflicts.map((conflict) => (
              <li key={conflict}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-slate-700 p-4 text-sm leading-6">
        <p className="font-medium">What to watch</p>
        <p className="mt-1 text-slate-300">{analysis.waitFor}</p>
      </div>
      <p className="text-xs leading-6 text-slate-500">
        Confluence measures evidence agreement, not the probability of a winning trade.
      </p>
      <details className="text-xs leading-6 text-slate-500">
        <summary className="cursor-pointer">Data limitations</summary>
        <ul className="mt-2 list-inside list-disc">
          {analysis.missing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
