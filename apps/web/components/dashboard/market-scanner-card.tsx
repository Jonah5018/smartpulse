import type {
  MarketScanResult,
} from "@/lib/market-scanner";

import type {
  SessionStatus,
} from "@/lib/market-session";

interface MarketScannerCardProps {
  results: MarketScanResult[];

  session: SessionStatus;
}

function statusClass(
  status: MarketScanResult["status"]
) {
  switch (status) {
    case "priority":
      return "text-emerald-400";

    case "watch":
      return "text-blue-400";

    case "candidate":
      return "text-amber-400";

    default:
      return "text-slate-500";
  }
}

function tierLabel(
  tier: MarketScanResult["tier"]
) {
  switch (tier) {
    case "core":
      return "Core";

    case "secondary":
      return "Secondary";

    case "extended":
      return "Extended";

    default:
      return tier;
  }
}

export function MarketScannerCard({
  results,
  session,
}: MarketScannerCardProps) {
  const marketClosed =
    !session.isOpen;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-blue-500">
            Smart Scanner
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Market Attention
          </h2>
        </div>

        <span className="text-xs text-slate-500">
          {marketClosed
            ? "Awaiting next session"
            : "Ranked by scanner score"}
        </span>
      </div>

      {marketClosed ? (
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/50 p-8 text-center">
          <p className="text-lg font-semibold text-slate-300">
            Market Closed
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {session.description}
          </p>

          <p className="mt-4 text-xs text-slate-600">
            Market scanning will resume when the
            next trading session opens.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-slate-800">
          {results.map(
            (market, index) => (
              <div
                key={market.symbol}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-400">
                    {index + 1}
                  </span>

                  <div>
                    <p className="font-semibold">
                      {market.symbol}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                      <span
                        className={`font-medium uppercase tracking-wider ${statusClass(
                          market.status
                        )}`}
                      >
                        {market.status}
                      </span>

                      <span className="text-slate-600">
                        •
                      </span>

                      <span className="text-slate-500">
                        {tierLabel(
                          market.tier
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Movement
                    </p>

                    <p
                      className={
                        market.changePercent > 0
                          ? "text-sm font-semibold text-emerald-400"
                          : market.changePercent < 0
                            ? "text-sm font-semibold text-red-400"
                            : "text-sm font-semibold text-slate-400"
                      }
                    >
                      {market.changePercent > 0
                        ? "+"
                        : ""}
                      {market.changePercent.toFixed(
                        2
                      )}
                      %
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Score
                    </p>

                    <p className="text-2xl font-bold text-blue-400">
                      {market.score}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">
                No market scan results are currently available.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}