import type {
  LiquidityAnalysis,
  LiquidityPool,
} from "@/lib/liquidity";

import {
  Flame,
  Target,
  Waves,
  ShieldAlert,
} from "lucide-react";

interface Props {
  analysis: LiquidityAnalysis;
}

const heatColor = {
  hot: "bg-red-500 text-red-100",
  warm: "bg-amber-500 text-amber-100",
  cold: "bg-slate-600 text-slate-100",
};

export function LiquidityHeatmapCard({
  analysis,
}: Props) {
  const buySide =
    analysis.pools.filter(
      (pool) => pool.side === "buy_side"
    );

  const sellSide =
    analysis.pools.filter(
      (pool) => pool.side === "sell_side"
    );

  const priority =
    analysis.highestPriority;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Institutional Liquidity Heatmap
          </h2>

          <p className="text-sm text-slate-400">
            Deterministic liquidity concentration
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 px-3 py-2 text-center">
          <p className="text-xs text-slate-400">
            Confidence
          </p>

          <p className="text-lg font-bold text-white">
            {analysis.confidence}%
          </p>
        </div>
      </div>

      {priority && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-400" />

            <span className="text-sm font-semibold text-red-300">
              Highest Priority Target
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {priority.price.toFixed(5)}
              </p>

              <p className="text-sm text-slate-300">
                {priority.side === "buy_side"
                  ? "Buy-side Liquidity"
                  : "Sell-side Liquidity"}
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${heatColor[priority.heat]}`}
            >
              {priority.heat.toUpperCase()}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <Metric
              label="Target"
              value={priority.targetScore.toString()}
            />
            <Metric
              label="Touches"
              value={priority.touches.toString()}
            />
            <Metric
              label="Strength"
              value={priority.strength.toString()}
            />
          </div>
        </div>
      )}

      <PoolSection
        title="Buy-side Liquidity"
        icon={<Target className="h-4 w-4 text-red-400" />}
        pools={buySide}
      />

      <PoolSection
        title="Sell-side Liquidity"
        icon={<Waves className="h-4 w-4 text-blue-400" />}
        pools={sellSide}
      />

      {analysis.latestSweep && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />

            <span className="font-medium text-amber-300">
              Latest Liquidity Sweep
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-200">
            {analysis.latestSweep.side === "buy_side"
              ? "Buy-side liquidity was swept and rejected."
              : "Sell-side liquidity was swept and rejected."}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Level: {analysis.latestSweep.price.toFixed(5)}
          </p>
        </div>
      )}

      <div className="rounded-xl bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Institutional Summary
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-200">
          {analysis.summary}
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
    <div>
      <p className="text-lg font-bold text-white">
        {value}
      </p>
      <p className="text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}

function PoolSection({
  title,
  icon,
  pools,
}: {
  title: string;
  icon: React.ReactNode;
  pools: LiquidityPool[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}

        <h3 className="font-medium text-white">
          {title}
        </h3>
      </div>

      {pools.length === 0 ? (
        <p className="text-sm text-slate-500">
          No liquidity pools detected.
        </p>
      ) : (
        pools.slice(0, 3).map((pool) => (
          <div
            key={`${pool.side}-${pool.price}`}
            className="rounded-lg bg-slate-900 p-3"
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium text-white">
                {pool.price.toFixed(5)}
              </span>

              <span
                className={`rounded px-2 py-0.5 text-xs ${heatColor[pool.heat]}`}
              >
                {pool.heat.toUpperCase()}
              </span>
            </div>

            <div className="mt-2 h-2 rounded bg-slate-700">
              <div
                className={`h-2 rounded ${
                  pool.heat === "hot"
                    ? "bg-red-500"
                    : pool.heat === "warm"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    pool.targetScore
                  )}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>
                Score {pool.targetScore}
              </span>

              <span>
                {pool.distance.toFixed(5)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}