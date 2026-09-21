import Link from "next/link";
import { BookOpen, Plus, ArrowUpRight } from "lucide-react";
import { requireTrader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SavedJournalRepository } from "@/lib/journal/saved-journal-repository";
import { realizedR } from "@/lib/journal/entry-model";
import { normalizeMarketSymbol } from "@/lib/market/market-universe";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
import { StorageNotice } from "@/components/journal/storage-notice";

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ status?: string; symbol?: string; page?: string }> }) {
  const { profile, user } = await requireTrader();
  const params = await searchParams;
  const status = ["planned", "open", "closed", "archived"].includes(params.status ?? "") ? params.status! : "all";
  const symbol = normalizeMarketSymbol((params.symbol ?? "").slice(0,20));
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(10000, requestedPage) : 1;
  let result: Awaited<ReturnType<typeof SavedJournalRepository.list>> | null = null;
  try { result = await SavedJournalRepository.list(await createClient(), user.id, page, status, symbol); } catch { /* Render an explicit unavailable state, never a fabricated empty result. */ }
  const closed = result?.entries.filter(e => e.status === "closed") ?? [];
  const results = closed.map(realizedR).filter((r): r is number => r !== null);
  const wins = results.filter(r => r > 0).length;
  const pageUrl = (value: number) => `/journal?${new URLSearchParams({ status, symbol, page: String(value) })}`;
  return <DashboardShell profile={profile}><div className="space-y-8">
    <PageHeading eyebrow="Reflect. Refine. Repeat." title="Trading journal" description="Turn your trading decisions into a record you can learn from. Plan the trade, capture the evidence, and review the outcome." actions={<Link href="/journal/new" className="sp-button-primary"><Plus size={17} /> New entry</Link>} />
    <div className="grid gap-4 sm:grid-cols-3">{[["Matching entries", result?.count ?? "—", "Across your current filters"], ["Closed on this page", result ? closed.length : "—", "Planned ideas are not counted"], ["Win rate on this page", results.length ? `${Math.round(wins / results.length * 100)}%` : "—", "Based on recorded price outcomes"]].map(([label,value,hint]) => <div className="sp-panel" key={label}><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-slate-500">{hint}</p></div>)}</div>
    <section className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Your trading record</h2><p className="mt-1 text-sm text-slate-400">A clear view of your ideas and executions.</p></div><form className="flex w-full flex-wrap gap-3 sm:w-auto"><label className="sr-only" htmlFor="journal-status">Filter by status</label><select id="journal-status" name="status" defaultValue={status} className="sp-input !w-auto"><option value="all">All active entries</option><option value="planned">Planned</option><option value="open">Open</option><option value="closed">Closed</option><option value="archived">Archived</option></select><label className="sr-only" htmlFor="journal-symbol">Filter by market</label><input id="journal-symbol" name="symbol" defaultValue={symbol} placeholder="Market, e.g. XAU/USD" maxLength={20} className="sp-input sm:!w-48" /><button className="sp-button-secondary">Apply filters</button></form></div>
      {!result ? <StorageNotice /> : result.entries.length === 0 ? <div className="sp-panel flex flex-col items-center py-14 text-center"><div className="mb-5 rounded-2xl bg-blue-500/10 p-4 text-blue-400"><BookOpen size={28} /></div><h3 className="text-xl font-semibold">{result.count ? "No entries on this page" : status !== "all" || symbol ? "No entries match these filters" : "Your next lesson starts here"}</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Record your first idea or trade. A thoughtful review is useful whether the outcome was a win, a loss, or a decision to wait.</p><Link href={status !== "all" || symbol || page > 1 ? "/journal" : "/journal/new"} className="sp-button-secondary mt-6">{status !== "all" || symbol || page > 1 ? "Reset filters" : "Create your first entry"}</Link></div> : <div className="overflow-hidden rounded-2xl border border-slate-800"><div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] gap-4 bg-slate-900/70 px-6 py-3 text-xs text-slate-500 md:grid"><span>Market / date</span><span>Direction</span><span>Status</span><span>Result</span><span>Evidence</span><span className="sr-only">Open</span></div>{result.entries.map(entry => { const r = realizedR(entry); return <Link key={entry.id} href={`/journal/${entry.id}`} className="grid grid-cols-2 items-center gap-4 border-t border-slate-800/70 bg-slate-900/20 p-5 transition first:border-t-0 hover:bg-slate-800/40 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] md:px-6"><div><p className="font-semibold">{entry.symbol}</p><p className="mt-1 text-xs text-slate-500">{entry.trade_date}</p></div><p className={`text-sm font-medium capitalize ${entry.direction === "buy" ? "text-teal-300" : "text-rose-300"}`}>{entry.direction} <span className="ml-1 text-xs text-slate-500">{entry.timeframe}</span></p><div><span className="sp-badge">{entry.archived ? "Archived" : entry.status}</span></div><p className={`font-mono text-sm ${r !== null && r > 0 ? "text-teal-300" : r !== null && r < 0 ? "text-rose-300" : "text-slate-400"}`}>{r === null ? "Not closed" : `${r > 0 ? "+" : ""}${r.toFixed(2)}R`}</p><p className="text-xs text-slate-400">{entry.snapshot ? "Analysis saved" : "Manual entry"}</p><ArrowUpRight size={17} className="justify-self-end text-slate-500" /></Link>; })}</div>}
      {result && <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><p>Up to 20 entries per page · R excludes fees and partial exits.</p><div className="flex items-center gap-4">{page > 1 && <Link className="sp-button-secondary" href={pageUrl(page-1)}>Previous</Link>}<span>Page {page}</span>{page*20 < result.count && <Link className="sp-button-secondary" href={pageUrl(page+1)}>Next</Link>}</div></div>}
    </section>
  </div></DashboardShell>;
}
