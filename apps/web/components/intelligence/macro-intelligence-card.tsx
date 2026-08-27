import type { MacroAnalysisResult } from "@/lib/macro";
import { BadgeAlert, Globe } from "lucide-react";

interface Props {
  analysis: MacroAnalysisResult;
}

export function MacroIntelligenceCard({ analysis }: Props) {
  const confidence = Math.round(analysis.confidence * 100);

  const biasColor = {
    bullish: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    bearish: "bg-red-500/15 text-red-400 border-red-500/30",
    neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  }[analysis.overallBias];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2">
            <Globe className="h-5 w-5 text-cyan-400" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Macro Intelligence
            </h3>

            <p className="text-xs text-slate-400">
              Deterministic institutional macro analysis
            </p>
          </div>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs font-medium ${biasColor}`}
        >
          {analysis.overallBias.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-slate-400">Confidence</p>

          <p className="mt-1 text-2xl font-bold text-white">
            {confidence}%
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-slate-400">Events</p>

          <p className="mt-1 text-2xl font-bold text-white">
            {analysis.insights.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {analysis.insights.map((item) => (
          <div
            key={item.event}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{item.event}</p>

                <p className="text-xs text-slate-400">{item.currency}</p>
              </div>

              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  item.bias === "bullish"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : item.bias === "bearish"
                    ? "bg-red-500/15 text-red-400"
                    : "bg-slate-500/15 text-slate-300"
                }`}
              >
                {item.bias.toUpperCase()}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-300">
              {item.narrative.summary}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
        <div className="flex items-start gap-2">
          <BadgeAlert className="mt-0.5 h-4 w-4 text-amber-400" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
              Institutional Note
            </p>

            <p className="mt-1 text-sm text-amber-100">
              Macro intelligence provides market context only. It does not
              override SmartPulse's confluence score or generate trading signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}