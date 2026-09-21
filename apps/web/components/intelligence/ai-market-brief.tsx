interface AIMarketBriefProps {
  brief: string | null;
  fallback?: string;
}

export function AIMarketBrief({
  brief,
  fallback,
}: AIMarketBriefProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {brief ? "SmartPulse AI Brief" : "Market summary"}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {brief ? "Contextual institutional reasoning" : "Computed from the current setup"}
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
          {brief ? "AI explanation" : "Analysis"}
        </span>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-5">
        {brief ? (
          <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
            {brief}
          </p>
        ) : (
          <p className="text-sm leading-7 text-slate-500">
            {fallback ?? "The AI brief is currently unavailable. The institutional analysis remains available when market data can be loaded."}
          </p>
        )}
      </div>
      {!brief && fallback && <p className="mt-4 text-xs leading-5 text-slate-500">AI explanation unavailable. This summary comes from the analysis engine.</p>}
    </section>
  );
}
