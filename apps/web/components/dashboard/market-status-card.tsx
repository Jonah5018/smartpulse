interface MarketStatusCardProps {
  marketStatus: string;

  tradingDay: boolean;

  holiday: boolean;

  earlyClose: boolean;

  closeTime: string | null;
}

export function MarketStatusCard({
  marketStatus,
  tradingDay,
  holiday,
  earlyClose,
  closeTime,
}: MarketStatusCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="text-lg font-semibold">
        Market Status
      </h3>

      <div className="mt-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">
            Status
          </span>

          <span
            className={
              tradingDay
                ? "font-medium text-emerald-400"
                : "font-medium text-red-400"
            }
          >
            {marketStatus}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">
            Holiday
          </span>

          <span>
            {holiday
              ? "Yes"
              : "No"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">
            Early Close
          </span>

          <span>
            {earlyClose
              ? "Yes"
              : "No"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">
            Close Time
          </span>

          <span>
            {closeTime ?? "--"}
          </span>
        </div>
      </div>
    </div>
  );
}