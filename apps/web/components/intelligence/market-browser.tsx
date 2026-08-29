
import { MARKET_UNIVERSE } from "@/lib/market/market-universe";
import type { MarketInstrument } from "@/lib/market/market-universe";

interface Props {
  selected: string;
  onSelect: (symbol: string) => void;
}

export function MarketBrowser({
  selected,
  onSelect,
}: Props) {
  const groups = {
    Forex: MARKET_UNIVERSE.filter(
      (m) => m.type === "forex" && m.enabled
    ),
    Metals: MARKET_UNIVERSE.filter(
      (m) => m.type === "commodity" && m.enabled
    ),
    Crypto: MARKET_UNIVERSE.filter(
      (m) => m.type === "crypto" && m.enabled
    ),
    Indices: MARKET_UNIVERSE.filter(
      (m) => m.type === "index" && m.enabled
    ),
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
          Market Universe
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Institutional Market Browser
        </h2>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([title, markets]) =>
          markets.length > 0 ? (
            <MarketGroup
              key={title}
              title={title}
              markets={markets}
              selected={selected}
              onSelect={onSelect}
            />
          ) : null
        )}
      </div>
    </section>
  );
}

function MarketGroup({
  title,
  markets,
  selected,
  onSelect,
}: {
  title: string;
  markets: MarketInstrument[];
  selected: string;
  onSelect: (symbol: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      <div className="flex flex-wrap gap-3">
        {markets.map((market) => {
          const active =
            selected === market.symbol;

          return (
            <button
              key={market.symbol}
              onClick={() =>
                onSelect(market.symbol)
              }
              className={`rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? "border-blue-500 bg-blue-500/15"
                  : "border-slate-700 bg-slate-900 hover:border-slate-500"
              }`}
            >
              <p className="font-semibold text-white">
                {market.symbol}
              </p>

              <p className="text-xs text-slate-400">
                {market.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}