import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTrader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SavedJournalRepository } from "@/lib/journal/saved-journal-repository";
import { realizedR } from "@/lib/journal/entry-model";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
import { ArchiveEntry, EntryForm } from "@/components/journal/entry-form";
import { StorageNotice } from "@/components/journal/storage-notice";
import { AITradeJournalCard } from "@/components/intelligence/ai-trade-journal-card";

export default async function EntryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string; saved?: string }> }) {
  const { profile, user } = await requireTrader();
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  let entry;
  try { entry = await SavedJournalRepository.get(await createClient(), user.id, id); } catch { return <DashboardShell profile={profile}><StorageNotice /></DashboardShell>; }
  if (!entry) notFound();
  const r = realizedR(entry);
  return <DashboardShell profile={profile}><div className="mx-auto max-w-5xl space-y-7"><Link className="text-sm text-slate-400 hover:text-white" href="/journal">← Back to journal</Link><PageHeading eyebrow={`${entry.trade_date} · ${entry.timeframe}`} title={`${entry.symbol} · ${entry.direction === "buy" ? "Buy" : "Sell"}`} description={query.edit ? "Update the trade while preserving the original analysis." : "Your decision, execution and review in one place."} actions={!query.edit && <><span className="sp-badge">{entry.archived ? "Archived" : entry.status}</span><Link className="sp-button-primary" href={`/journal/${id}?edit=1`}>Edit entry</Link></>} />
    {query.saved && !query.edit && <p role="status" className="rounded-xl border border-teal-800/50 bg-teal-950/30 p-4 text-sm text-teal-200">Entry saved to your journal.</p>}
    {query.edit ? <EntryForm entry={entry} requestId={id} /> : <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{[["Entry", entry.entry_price], ["Initial stop", entry.stop_loss], ["Target", entry.take_profit], ["Exit", entry.exit_price], ["Price result", r === null ? null : `${r > 0 ? "+" : ""}${r.toFixed(2)}R`]].map(([label,value]) => <div key={label} className="sp-panel"><p className="text-xs text-slate-400">{label}</p><p className="mt-3 break-words font-mono text-lg font-medium">{value ?? "—"}</p></div>)}</div><p className="text-xs text-slate-500">R measures price movement against initial risk. Fees, partial exits and position size are not included.</p>
      <div className="grid gap-5 lg:grid-cols-2"><section className="sp-panel"><h2 className="font-semibold">Thesis & observations</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">{entry.notes || "No observations recorded yet."}</p></section><section className="sp-panel"><h2 className="font-semibold">Review & lesson</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">{entry.lesson || "Return after the trade to record what you learned."}</p></section></div>
      {entry.snapshot && <details className="sp-disclosure"><summary>Saved analysis · {new Date(entry.snapshot.generatedAt).toUTCString()}</summary><div className="space-y-4 p-4 sm:p-6"><p className="text-sm text-slate-400">Historical study snapshot. This does not update with the live market. Focus score at capture: {entry.snapshot.focusScore ?? "Unavailable"}.</p><AITradeJournalCard journal={entry.snapshot.journal} /></div></details>}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6"><p className="text-xs text-slate-500">Archived entries remain available in your journal filters.</p><ArchiveEntry entry={entry} /></div>
    </>}
  </div></DashboardShell>;
}
