import type {
  RegimeAnalysis,
} from "@/lib/market-regime";

import {
  ArrowUpRight,
  ArrowLeftRight,
  Shield,
  GitMerge,
} from "lucide-react";

interface Props {
  regime: RegimeAnalysis;
}

const styles = {
  trend: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: ArrowUpRight,
    title: "text-emerald-400",
  },

  range: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: ArrowLeftRight,
    title: "text-blue-400",
  },

  risk_off: {
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    icon: Shield,
    title: "text-red-400",
  },

  transition: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: GitMerge,
    title: "text-amber-400",
  },
};

export function MarketRegimeCard({
  regime,
}: Props) {
  const theme =
    styles[regime.regime];

  const Icon =
    theme.icon;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Institutional Context
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Market Regime
          </h2>
        </div>

        <div className="rounded-xl bg-slate-900 px-3 py-2 text-center">
          <p className="text-xs text-slate-400">
            Confidence
          </p>

          <p className="text-lg font-bold text-white">
            {Math.round(
              regime.confidence * 100
            )}
            %
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-4 ${theme.badge}`}>
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6" />

          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">
              Current Regime
            </p>

            <h3 className="text-lg font-semibold">
              {regime.title}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Regime"
          value={regime.regime.replace("_", " ")}
        />

        <Metric
          label="Conviction"
          value={`${Math.round(
            regime.confidence * 100
          )}%`}
        />
      </div>

      <div className="rounded-xl bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Description
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-200">
          {regime.description}
        </p>
      </div>

      <div className="rounded-xl bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Institutional Message
        </p>

        <p className={`mt-2 text-sm leading-6 ${theme.title}`}>
          {regime.institutionalMessage}
        </p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-900 p-3">
      <p className="text-lg font-bold text-white capitalize">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}