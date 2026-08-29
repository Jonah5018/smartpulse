import type { InstitutionalSetup } from "@/lib/institutional-setup";

interface Props {
  setup: InstitutionalSetup;
}

const stateColor = {
  ready: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  forming: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  no_setup: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function TopDownAnalysisCard({ setup }: Props) {
  const rr = setup.riskReward?.ratio;

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Institutional Analysis
          </p>
          <h2 className="text-2xl font-semibold text-white">
            {setup.symbol}
          </h2>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-sm font-medium ${
            stateColor[setup.state]
          }`}
        >
          {setup.state.replace("_", " ").toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">H4 Context</p>
          <p className="mt-2 text-lg font-semibold capitalize text-white">
            {setup.contextTrend}
          </p>
          <p className="text-xs text-neutral-400">
            {setup.contextTimeframe}
          </p>
        </div>

        <div className="rounded-xl bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">H1 Structure</p>
          <p className="mt-2 text-lg font-semibold uppercase text-white">
            {setup.structureEvent}
          </p>
          <p className="text-xs text-neutral-400">
            {setup.structureTimeframe}
          </p>
        </div>

        <div className="rounded-xl bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">M15 Direction</p>
          <p className="mt-2 text-lg font-semibold capitalize text-white">
            {setup.direction}
          </p>
          <p className="text-xs text-neutral-400">
            {setup.executionTimeframe}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">
            Institutional Confidence
          </p>
          <span className="text-lg font-bold text-white">
            {setup.confidence}%
          </span>
        </div>

        <div className="h-2 rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${setup.confidence}%` }}
          />
        </div>

        <p className="text-xs text-neutral-400">
          Grade {setup.confluence.grade} · {setup.confluence.confirmations} confirmations
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 p-4 space-y-2">
        <p className="text-sm font-medium text-white">
          AI Mentor Narrative
        </p>

        <p className="text-sm leading-6 text-neutral-300">
          {setup.explainability.narrative}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">Entry Zone</p>

          {setup.entryZone ? (
            <>
              <p className="mt-2 font-semibold text-white">
                {setup.entryZone.low.toFixed(5)} – {setup.entryZone.high.toFixed(5)}
              </p>
              <p className="text-xs text-neutral-400">
                Mid: {setup.entryZone.midpoint.toFixed(5)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              Waiting for FVG
            </p>
          )}
        </div>

        <div className="rounded-xl bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">Risk : Reward</p>

          {rr ? (
            <>
              <p className="mt-2 text-2xl font-bold text-white">
                1:{rr}
              </p>
              <p className="text-xs text-neutral-400">
                Institutional minimum ≥ 2.0
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              Not executable yet
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900 p-4 space-y-3">
        <p className="text-sm font-medium text-white">
          Execution Checklist
        </p>

        {[
          {
            ok: setup.multiTimeframeAlignment === "aligned",
            label: "Higher timeframe aligned",
          },
          {
            ok: setup.liquidity.latestSweep !== null,
            label: "Liquidity sweep confirmed",
          },
          {
            ok: setup.entryZone !== null,
            label: "Fair Value Gap available",
          },
          {
            ok: (setup.riskReward?.ratio ?? 0) >= 2,
            label: "Risk/Reward ≥ 2.0",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-neutral-300">
              {item.label}
            </span>

            <span
              className={`text-xs font-medium ${
                item.ok ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {item.ok ? "PASS" : "WAIT"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}