import type {
  ConfluenceMatrix,
} from "@/lib/confluence";

import {
  Trophy,
  Shield,
  Activity,
} from "lucide-react";

interface Props {
  matrix: ConfluenceMatrix;
}

const levelColor = {
  weak: "bg-slate-600 text-slate-100",
  moderate: "bg-blue-600 text-white",
  strong: "bg-emerald-600 text-white",
  exceptional: "bg-amber-500 text-black",
};

export function ConfluenceMatrixCard({
  matrix,
}: Props) {
  const breakdown = [
    {
      label: "Structure",
      value: matrix.breakdown.structure,
      max: 35,
      color: "bg-blue-500",
    },
    {
      label: "Liquidity",
      value: matrix.breakdown.liquidity,
      max: 25,
      color: "bg-red-500",
    },
    {
      label: "Regime",
      value: matrix.breakdown.regime,
      max: 15,
      color: "bg-purple-500",
    },
    {
      label: "Macro",
      value: matrix.breakdown.macro,
      max: 15,
      color: "bg-emerald-500",
    },
    {
      label: "Execution",
      value: matrix.breakdown.execution,
      max: 10,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#1A1305] via-[#111827] to-[#0B1220] p-6 space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="h-4 w-4" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Institutional Conviction
            </span>
          </div>

          <div className="mt-3 flex items-end gap-3">
            <span className="text-5xl font-bold text-white">
              {matrix.score}
            </span>

            <span className="pb-2 text-slate-400">
              / 100
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {matrix.institutionalSummary}
          </p>
        </div>

        <div
          className={`rounded-full px-5 py-2 text-sm font-bold uppercase ${levelColor[matrix.level]}`}
        >
          {matrix.level}
        </div>
      </div>

      <div className="grid gap-3">
        {breakdown.map((item) => (
          <div
            key={item.label}
            className="space-y-1"
          >
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">
                {item.label}
              </span>

              <span className="font-semibold text-white">
                {item.value}/{item.max}
              </span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div
                className={`h-2 rounded-full ${item.color}`}
                style={{
                  width: `${(item.value / item.max) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric
          icon={<Shield className="h-4 w-4" />}
          label="Level"
          value={matrix.level}
        />

        <Metric
          icon={<Activity className="h-4 w-4" />}
          label="Score"
          value={`${matrix.score}`}
        />

        <Metric
          icon={<Trophy className="h-4 w-4" />}
          label="Status"
          value={
            matrix.score >= 75
              ? "Tradable"
              : "Wait"
          }
        />
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-900 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold capitalize text-white">
        {value}
      </p>
    </div>
  );
}