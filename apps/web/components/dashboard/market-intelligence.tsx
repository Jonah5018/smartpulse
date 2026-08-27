import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import type {
  Opportunity,
} from "@/lib/opportunity";

import type {
  OpportunityDecision,
} from "@/lib/decision";

import type {
  FocusScore,
} from "@/lib/focus-score";


interface MarketIntelligenceProps {
  symbol: string;

  setup: InstitutionalSetup;

  opportunity: Opportunity;

  focus: FocusScore;

  decision: OpportunityDecision;
}


/*
 * ------------------------------------------------
 * DISPLAY HELPERS
 * ------------------------------------------------
 */

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


function priorityClass(
  priority: FocusScore["priority"]
) {
  switch (priority) {
    case "critical":
      return "text-red-400";

    case "high":
      return "text-emerald-400";

    case "watch":
      return "text-blue-400";

    case "low":
      return "text-amber-400";

    default:
      return "text-slate-400";
  }
}


function opportunityDirectionClass(
  direction: Opportunity["direction"]
) {
  switch (direction) {
    case "buy":
      return "text-emerald-400";

    case "sell":
      return "text-red-400";

    default:
      return "text-slate-400";
  }
}


function opportunityStateClass(
  state: Opportunity["state"]
) {
  switch (state) {
    case "ready":
      return "text-emerald-400";

    case "forming":
      return "text-amber-400";

    case "executed":
      return "text-blue-400";

    case "expired":
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


/*
 * ------------------------------------------------
 * FOCUS SCORE CONFIGURATION
 * ------------------------------------------------
 */

const FOCUS_FACTOR_LABELS = {
  opportunity:
    "Opportunity",

  setupReadiness:
    "Setup Readiness",

  multiTimeframeAlignment:
    "Multi-Timeframe Alignment",

  liquidity:
    "Liquidity",

  displacement:
    "Displacement",

  entryQuality:
    "Entry Quality",

  riskReward:
    "Risk / Reward",

  sessionQuality:
    "Session Quality",

  calendarRisk:
    "Calendar Risk",
} as const;


const FOCUS_FACTOR_ORDER = [
  "opportunity",
  "setupReadiness",
  "multiTimeframeAlignment",
  "liquidity",
  "displacement",
  "entryQuality",
  "riskReward",
  "sessionQuality",
  "calendarRisk",
] as const;


/*
 * ------------------------------------------------
 * COMPONENT
 * ------------------------------------------------
 */

export function MarketIntelligence({
  symbol,
  setup,
  opportunity,
  focus,
  decision,
}: MarketIntelligenceProps) {
  return (
    <div className="space-y-6">

      {/* -----------------------------------------
          HEADER
      ----------------------------------------- */}

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

            {/* FOCUS SCORE */}

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Focus Score
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-400">
                {focus.score}
              </p>

              <p
                className={`mt-1 text-xs font-semibold uppercase ${priorityClass(
                  focus.priority
                )}`}
              >
                {focus.priority}
              </p>

            </div>


            {/* DECISION */}

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


      {/* -----------------------------------------
          OPPORTUNITY COMMAND CENTER
      ----------------------------------------- */}

      <section className="rounded-2xl border border-blue-900/60 bg-gradient-to-br from-blue-950/20 via-slate-900/70 to-slate-950 p-6">

        <div className="flex flex-col gap-2">

          <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
            Opportunity Command Center
          </p>

          <h2 className="text-2xl font-semibold">
            Market Opportunity Snapshot
          </h2>

          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            SmartPulse separates the detected market
            opportunity from the attention score and
            final decision so the trader can understand
            both the opportunity and the recommended
            response.
          </p>

        </div>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* DIRECTION */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Direction
            </p>

            <p
              className={`mt-2 text-xl font-bold uppercase ${opportunityDirectionClass(
                opportunity.direction
              )}`}
            >
              {opportunity.direction}
            </p>

          </div>


          {/* OPPORTUNITY STATE */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Opportunity State
            </p>

            <p
              className={`mt-2 text-xl font-bold capitalize ${opportunityStateClass(
                opportunity.state
              )}`}
            >
              {formatText(
                opportunity.state
              )}
            </p>

          </div>


          {/* QUALITY */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Opportunity Quality
            </p>

            <p
              className={`mt-2 text-xl font-bold capitalize ${setupQualityClass(
                opportunity.quality
              )}`}
            >
              {opportunity.quality}
            </p>

          </div>


          {/* HIGHER TIMEFRAME BIAS */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Higher-Timeframe Bias
            </p>

            <p className="mt-2 text-xl font-bold capitalize">
              {opportunity.higherTimeframeBias}
            </p>

          </div>

        </div>


        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* SETUP CONTEXT */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Setup Context
            </p>

            <p className="mt-2 font-medium capitalize">
              {formatText(
                opportunity.setupContext
              )}
            </p>

          </div>


          {/* MTF ALIGNMENT */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Multi-Timeframe Alignment
            </p>

            <p className="mt-2 font-medium capitalize">
              {formatText(
                opportunity.multiTimeframeAlignment
              )}
            </p>

          </div>


          {/* STRUCTURE EVENT */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Structure Event
            </p>

            <p className="mt-2 font-medium uppercase">
              {opportunity.structureEvent}
            </p>

          </div>

        </div>


        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">

          <p className="text-xs uppercase tracking-wider text-blue-400">
            Opportunity Summary
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-300">
            {opportunity.summary}
          </p>

        </div>

      </section>


      {/* -----------------------------------------
          FOCUS SCORE EXPLANATION
      ----------------------------------------- */}

      <section className="rounded-2xl border border-blue-900/60 bg-gradient-to-br from-blue-950/20 via-slate-900/70 to-slate-950 p-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
              Explainable Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Why This Market Has a {focus.score} Focus Score
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              SmartPulse combines institutional opportunity,
              setup readiness, multi-timeframe alignment,
              liquidity, execution quality, risk/reward,
              session conditions and calendar risk into one
              attention score.
            </p>

          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Recommended Action
            </p>

            <p className="mt-2 text-lg font-semibold capitalize text-blue-400">
              {formatText(
                focus.action
              )}
            </p>

          </div>

        </div>


        {/* SCORE BREAKDOWN */}

        <div className="mt-6 space-y-4">

          {FOCUS_FACTOR_ORDER.map(
            (factorKey) => {
              const factor =
                focus.breakdown[
                  factorKey
                ];

              const label =
                FOCUS_FACTOR_LABELS[
                  factorKey
                ];

              const percentage =
                Math.min(
                  100,
                  Math.max(
                    0,
                    factor.rawScore
                  )
                );

              return (
                <div
                  key={factorKey}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm font-medium text-slate-200">
                        {label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {Math.round(
                          factor.weight * 100
                        )}
                        % weighting
                      </p>

                    </div>


                    <div className="text-right">

                      <p className="text-sm font-semibold text-slate-200">
                        +{factor.contribution.toFixed(2)}
                      </p>

                      <p className="text-xs text-slate-500">
                        {Math.round(
                          factor.rawScore
                        )}
                        / 100
                      </p>

                    </div>

                  </div>


                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            }
          )}

        </div>


        {/* REASON */}

        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">

          <p className="text-xs uppercase tracking-wider text-blue-400">
            SmartPulse Reasoning
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-300">
            {focus.reason}
          </p>

        </div>


        {/* FOCUS WARNINGS */}

        {focus.warnings.length > 0 && (

          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">

            <p className="text-xs uppercase tracking-wider text-amber-400">
              Focus Warnings
            </p>

            <ul className="mt-3 space-y-2">

              {focus.warnings.map(
                (warning) => (
                  <li
                    key={warning}
                    className="text-sm leading-6 text-slate-400"
                  >
                    • {warning}
                  </li>
                )
              )}

            </ul>

          </div>
        )}

      </section>


      {/* -----------------------------------------
          INSTITUTIONAL SETUP
      ----------------------------------------- */}

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
              {formatText(
                setup.state
              )}
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


      {/* -----------------------------------------
          MARKET CONTEXT
      ----------------------------------------- */}

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


      {/* -----------------------------------------
          LIQUIDITY & PRICE
      ----------------------------------------- */}

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
              {setup.displacement.detected
                ? setup.displacement.direction
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


      {/* -----------------------------------------
          TRADE FRAMEWORK
      ----------------------------------------- */}

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


      {/* -----------------------------------------
          DECISION
      ----------------------------------------- */}

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


        {decision.warnings.length > 0 && (

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


      {/* -----------------------------------------
          INSTITUTIONAL REASONING
      ----------------------------------------- */}

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