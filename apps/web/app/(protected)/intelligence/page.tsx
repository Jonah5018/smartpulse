import { DashboardShell } from "@/components/layout/dashboard-shell";

import {
  MarketIntelligence,
} from "@/components/dashboard/market-intelligence";

import {
  LoadMarketIntelligence,
} from "@/lib/application/intelligence/load-market-intelligence";

import {
  requireTrader,
} from "@/lib/auth";


interface IntelligencePageProps {
  searchParams: Promise<{
    symbol?: string;
  }>;
}


const ALLOWED_SYMBOLS = [
  "GBP/USD",
  "EUR/USD",
  "USD/JPY",
  "XAU/USD",
];


export default async function IntelligencePage({
  searchParams,
}: IntelligencePageProps) {
  const { profile } =
    await requireTrader();

  const params =
    await searchParams;

  const requestedSymbol =
    params.symbol ??
    "GBP/USD";

  const symbol =
    ALLOWED_SYMBOLS.includes(
      requestedSymbol
    )
      ? requestedSymbol
      : "GBP/USD";

  const intelligence =
    await LoadMarketIntelligence.execute(
      symbol
    );

  return (
    <DashboardShell
      profile={profile}
    >
      <div className="space-y-6">

        <div className="flex flex-wrap gap-2">
          {ALLOWED_SYMBOLS.map(
            (market) => (
              <a
                key={market}
                href={`/intelligence?symbol=${encodeURIComponent(
                  market
                )}`}
                className={
                  market === symbol
                    ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400 transition hover:border-blue-700 hover:text-white"
                }
              >
                {market}
              </a>
            )
          )}
        </div>


        <MarketIntelligence
          symbol={
            intelligence.symbol
          }
          setup={
            intelligence.setup
          }
          focus={
            intelligence.focus
          }
          decision={
            intelligence.decision
          }
        />

      </div>
    </DashboardShell>
  );
}