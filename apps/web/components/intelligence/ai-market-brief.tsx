interface AIMarketBriefProps {
  brief: string | null;
}

export function AIMarketBrief({
  brief,
}: AIMarketBriefProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            SmartPulse AI Brief
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Contextual institutional reasoning
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
          GPT-5
        </span>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-5">
        {brief ? (
          <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
            {brief}
          </p>
        ) : (
          <p className="text-sm leading-7 text-slate-500">
            OpenAI is not configured yet. SmartPulse is currently operating in deterministic institutional analysis mode.
          </p>
        )}
      </div>
    </section>
  );
}