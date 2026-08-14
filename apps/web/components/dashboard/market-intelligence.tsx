import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  OpportunityDecision,
} from "@/lib/decision";

import type {
  FocusScore,
} from "@/lib/focus-score";


interface MarketIntelligenceProps {
  symbol: string;

  setup: InstitutionalSetup;

  focus: FocusScore;

  decision: OpportunityDecision;
}


function setupQualityClass(
  quality: InstitutionalSetup["quality"]
) {
  switch (quality) {
    case "exceptional":
      return "text-emerald-400";

    case "high":
      return "text-blue-400";

    case "moderate":
      return "text-amber-400";

    default:
      return "text-slate-400";
  }
}


function decisionClass(
  state: OpportunityDecision["state"]
) {
  switch (state) {
    case "confirmed":
      return "text-emerald-400";

    case "ready":
      return "text-blue-400";

    case "forming":
      return "text-amber-400";

    case "invalidated":
      return "text-red-400";

    default:
      return "text-slate-400";
  }
}


function formatValue(
  value: number | null
) {
  if (value === null) {
    return "Not available";
  }

  return value.toString();
}


function formatText(
  value: string
) {
  return value.replace(
    /_/g,
    " "
  );
}


export function MarketIntelligence({
  symbol,
  setup,
  focus,
  decision,
}: MarketIntelligenceProps) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-500">
              Pulse Intelligence
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {symbol}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Institutional market analysis combining
              market structure, liquidity, multi-timeframe
              context and execution conditions.
            </p>
          </div>


          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Focus Score
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-400">
                {focus.score}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {focus.priority}
              </p>
            </div>


            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Decision
              </p>

              <p
                className={`mt-2 text-xl font-bold uppercase ${decisionClass(
                  decision.state
                )}`}
              >
                {decision.state}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {decision.confidence}% confidence
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* Institutional Setup */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
            Institutional Setup
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Setup Analysis
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {setup.summary}
          </p>
        </div>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-500">
              Direction
            </p>

            <p className="mt-2 text-lg font-semibold capitalize">
              {setup.direction}
            </p>
          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-500">
              Setup State
            </p>

            <p className="mt-2 text-lg font-semibold capitalize">
              {formatText(setup.state)}
            </p>
          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-500">
              Quality
            </p>

            <p
              className={`mt-2 text-lg font-semibold capitalize ${setupQualityClass(
                setup.quality
              )}`}
            >
              {setup.quality}
            </p>
          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-500">
              Confidence
            </p>

            <p className="mt-2 text-lg font-semibold">
              {setup.confidence}%
            </p>
          </div>

        </div>

      </section>


      {/* Market Context */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
          Market Context
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Multi-Timeframe Structure
        </h2>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <p className="text-xs text-slate-500">
              Context Trend
            </p>

            <p className="mt-2 font-medium capitalize">
              {setup.contextTrend}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              {setup.contextTimeframe}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Market Structure
            </p>

            <p className="mt-2 font-medium capitalize">
              {setup.marketStructure}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Structure Event
            </p>

            <p className="mt-2 font-medium uppercase">
              {setup.structureEvent}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              MTF Alignment
            </p>

            <p className="mt-2 font-medium capitalize">
              {formatText(
                setup.multiTimeframeAlignment
              )}
            </p>
          </div>

        </div>

      </section>


      {/* Liquidity and Price */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
          Price Delivery
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Liquidity & Execution Structure
        </h2>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <p className="text-xs text-slate-500">
              Liquidity Sweep
            </p>

            <p className="mt-2 font-medium capitalize">
              {setup.liquiditySweep
                ? formatText(
                    setup.liquiditySweep
                  )
                : "None detected"}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Displacement
            </p>

            <p className="mt-2 font-medium capitalize">
              {setup.displacement
                ? setup.displacement
                : "None detected"}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Fair Value Gap
            </p>

            <p className="mt-2 font-medium">
              {setup.fairValueGap
                ? `${setup.fairValueGap.low} — ${setup.fairValueGap.high}`
                : "None detected"}
            </p>
          </div>

        </div>

      </section>


      {/* Trade Plan */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
          Trade Framework
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Price Plan
        </h2>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div>
            <p className="text-xs text-slate-500">
              Entry Zone
            </p>

            <p className="mt-2 text-sm font-medium">
              {setup.entryZone
                ? `${setup.entryZone.low} — ${setup.entryZone.high}`
                : "Not defined"}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Invalidation
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatValue(
                setup.invalidation
              )}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Target Liquidity
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatValue(
                setup.targetLiquidity
              )}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Risk / Reward
            </p>

            <p className="mt-2 text-sm font-medium">
              {setup.riskReward
                ? `${setup.riskReward.ratio}`
                : "Not defined"}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-500">
              Execution TF
            </p>

            <p className="mt-2 text-sm font-medium">
              {setup.executionTimeframe}
            </p>
          </div>

        </div>

      </section>


      {/* Decision */}
      <section className="rounded-2xl border border-blue-900/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
              SmartPulse Decision
            </p>

            <h2
              className={`mt-2 text-3xl font-bold uppercase ${decisionClass(
                decision.state
              )}`}
            >
              {decision.state}
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              {decision.message}
            </p>

          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Next Action
            </p>

            <p className="mt-2 text-lg font-semibold">
              {decision.action.replace(
                /_/g,
                " "
              )}
            </p>

          </div>

        </div>


        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">

          <p className="text-xs uppercase tracking-wider text-blue-400">
            SmartPulse Guidance
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {decision.nextAction}
          </p>

        </div>


        {decision.warnings.length >
          0 && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">

            <p className="text-xs uppercase tracking-wider text-amber-400">
              Warnings
            </p>

            <ul className="mt-3 space-y-2">

              {decision.warnings.map(
                (warning) => (
                  <li
                    key={warning}
                    className="text-sm text-slate-400"
                  >
                    • {warning}
                  </li>
                )
              )}

            </ul>

          </div>
        )}

      </section>


      {/* Explanation */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
          Institutional Reasoning
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Why SmartPulse Sees It This Way
        </h2>

        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400">
          {setup.explanation}
        </p>

      </section>

    </div>
  );
}