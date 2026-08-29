import type {
  LiquidityMap,
} from "@/lib/institutional/liquidity";

interface Props {
  analysis: LiquidityMap;
}

export function LiquidityLadderCard({
  analysis,
}: Props) {
  const buy =
    analysis.nearestBuySide;

  const sell =
    analysis.nearestSellSide;

  const sweep =
    analysis.latestSweep;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
            Institutional Liquidity
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Liquidity Ladder
          </h2>
        </div>

        <div className="rounded-xl bg-slate-900 px-3 py-2">
          <p className="text-xs text-slate-500">
            Confidence
          </p>

          <p className="text-xl font-bold text-white">
            {analysis.confidence}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Row
          label="Buy-side Liquidity"
          value={
            buy
              ? buy.price.toFixed(5)
              : "—"
          }
          color="emerald"
        />

        <div className="border-t border-dashed border-slate-800" />

        <Row
          label="Current Price Zone"
          value="LIVE"
          color="blue"
        />

        <div className="border-t border-dashed border-slate-800" />

        <Row
          label="Sell-side Liquidity"
          value={
            sell
              ? sell.price.toFixed(5)
              : "—"
          }
          color="rose"
        />
      </div>

      <div className="rounded-2xl bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Latest Sweep
        </p>

        {sweep ? (
          <>
            <p className="mt-2 text-lg font-semibold text-white">
              {sweep.side ===
              "buy_side"
                ? "Buy-side Sweep"
                : "Sell-side Sweep"}
            </p>

            <p className="text-sm text-slate-400">
              Liquidity engineered at{" "}
              {sweep.price != null
                ? sweep.price.toFixed(5)
                : "—"}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No confirmed liquidity sweep yet.
          </p>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color:
    | "emerald"
    | "rose"
    | "blue";
}) {
  const dot =
    color === "emerald"
      ? "bg-emerald-400"
      : color === "rose"
      ? "bg-rose-400"
      : "bg-blue-400";

  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-900/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`h-3 w-3 rounded-full ${dot}`}
        />

        <span className="text-sm text-slate-300">
          {label}
        </span>
      </div>

      <span className="font-mono text-white">
        {value}
      </span>
    </div>
  );
}