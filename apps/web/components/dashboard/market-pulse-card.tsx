import type {
  MarketPulse,
} from "@/lib/market";

interface MarketPulseCardProps {
  pulse: MarketPulse;
}

export function MarketPulseCard({
  pulse,
}: MarketPulseCardProps) {
  const trendLabel =
    pulse.trend === "bullish"
      ? "Bullish Conditions"
      : pulse.trend === "bearish"
        ? "Bearish Conditions"
        : "Balanced Conditions";

  const trendClass =
    pulse.trend === "bullish"
      ? "text-emerald-400"
      : pulse.trend === "bearish"
        ? "text-red-400"
        : "text-slate-400";

  return (
    <div className="rounded-2xl border border-blue-900/50 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Market Pulse
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {pulse.score}
          </h2>

          <p className={`mt-2 ${trendClass}`}>
            {trendLabel}
          </p>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20">
          <span className="text-xl font-bold text-blue-400">
            %
          </span>
        </div>
      </div>

      <div className="mt-6 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{
            width: `${pulse.score}%`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Confidence: {pulse.confidence}%
        </span>

        <span>
          Volatility: {pulse.volatility}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-400">
        {pulse.summary}
      </p>
    </div>
  );
}