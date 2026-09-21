import { randomUUID } from "node:crypto";
import Link from "next/link";
import { requireTrader } from "@/lib/auth";
import { AnalysisCacheService } from "@/lib/analysis-cache";
import { normalizeMarketSymbol } from "@/lib/market/market-universe";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
import { EntryForm } from "@/components/journal/entry-form";

export default async function NewEntryPage({ searchParams }: { searchParams: Promise<{ symbol?: string; capture?: string }> }) {
  const { profile } = await requireTrader();
  const params = await searchParams;
  const symbol = normalizeMarketSymbol((params.symbol ?? "").slice(0,20));
  const cached = symbol ? AnalysisCacheService.get(symbol) : null;
  const journal = cached?.tradeJournal;
  return <DashboardShell profile={profile}><div className="mx-auto max-w-5xl space-y-7"><Link className="text-sm text-slate-400 hover:text-white" href="/journal">← Back to journal</Link><PageHeading eyebrow="Trading journal" title="Capture a decision" description="Save an idea today. Add execution details and a lesson when you are ready." />
    {cached && <p className="sp-notice">Analysis available from {new Date(cached.generatedAt).toUTCString()}. Prefilled prices are analysis levels; confirm your own execution details before marking a trade open or closed.</p>}
    <EntryForm requestId={randomUUID()} captureAvailable={!!cached} captureRequested={params.capture === "1"} defaults={{ symbol, direction: journal?.direction === "sell" ? "sell" : "buy", status: "planned", timeframe: journal?.timeframe ?? "15min", trade_date: new Date().toLocaleDateString("en-CA", { timeZone: profile.timezone || "UTC" }), entry_price: journal?.riskPlan.entry ?? null, stop_loss: journal?.riskPlan.stop ?? null, take_profit: journal?.riskPlan.target ?? null }} />
  </div></DashboardShell>;
}
