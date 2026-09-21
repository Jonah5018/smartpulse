"use client";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { saveEntry, archiveEntry } from "@/app/(protected)/journal/actions";
import type { EntryInput, SavedJournalEntry } from "@/lib/journal/entry-model";

export function EntryForm({ entry, defaults, requestId, captureAvailable = false, captureRequested = false }: { entry?: SavedJournalEntry; defaults?: Partial<EntryInput>; requestId: string; captureAvailable?: boolean; captureRequested?: boolean }) {
  const values = entry ?? defaults;
  const [state, action, pending] = useActionState(saveEntry.bind(null, entry?.id ?? null), {});
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(values ?? {}).map(([key, value]) => [key, value == null ? "" : String(value)])));
  const change = (name: string, value: string) => setDraft(previous => ({ ...previous, [name]: value }));
  const [status, setStatus] = useState(values?.status ?? "planned");
  // Failed actions must preserve every draft field, including native select values.
  return <form onSubmit={event => {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }} className="space-y-6">
    <input type="hidden" name="request_id" value={requestId} /><input type="hidden" name="updated_at" value={entry?.updated_at ?? ""} />
    <section className="sp-panel"><div className="mb-6"><h2 className="text-lg font-semibold">The trade</h2><p className="mt-1 text-sm text-slate-400">Start with an idea. Update the entry as your trade develops.</p></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="sp-label">Market<input className="sp-input" name="symbol" required maxLength={20} placeholder="e.g. XAU/USD" value={draft.symbol ?? ""} onChange={e => change("symbol", e.target.value)} readOnly={!!entry?.snapshot} /></label>
        <label className="sp-label">Direction<select className="sp-input" name="direction" value={draft.direction ?? "buy"} onChange={e => change("direction", e.target.value)}><option value="buy">Buy / Long</option><option value="sell">Sell / Short</option></select></label>
        <label className="sp-label">Status<select className="sp-input" name="status" value={status} onChange={e => setStatus(e.target.value as typeof status)}><option value="planned">Planned — idea only</option><option value="open">Open — trade entered</option><option value="closed">Closed — trade exited</option></select></label>
        <label className="sp-label">Trade date<input className="sp-input" name="trade_date" type="date" required value={draft.trade_date ?? ""} onChange={e => change("trade_date", e.target.value)} /></label>
        <label className="sp-label">Timeframe<select className="sp-input" name="timeframe" value={draft.timeframe ?? "15min"} onChange={e => change("timeframe", e.target.value)}>{["1min", "5min", "15min", "30min", "1h", "4h", "1day"].map(tf => <option key={tf}>{tf}</option>)}</select></label>
      </div>
    </section>
    <section className="sp-panel"><h2 className="text-lg font-semibold">Risk & execution</h2><p className="mt-1 mb-6 text-sm text-slate-400">Use your actual fills for open and closed trades. Keep the initial stop to measure your original risk.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{([ ["entry_price", "Entry price"], ["stop_loss", "Initial stop"], ["take_profit", "Target price"], ["exit_price", "Exit price"] ] as const).map(([name, label]) => <label className="sp-label" key={name}>{label}<input className="sp-input" name={name} type="number" step="any" min="0.00000001" placeholder="Not defined" disabled={name === "exit_price" && status !== "closed"} required={name === "exit_price" ? status === "closed" : name !== "take_profit" && status !== "planned"} value={draft[name] ?? ""} onChange={e => change(name, e.target.value)} /></label>)}</div>
    </section>
    <section className="sp-panel"><h2 className="text-lg font-semibold">Build your edge</h2><div className="mt-5 grid gap-5 lg:grid-cols-2"><label className="sp-label">Thesis & observations<textarea name="notes" className="sp-input min-h-36" maxLength={5000} value={draft.notes ?? ""} onChange={e => change("notes", e.target.value)} placeholder="What did you see? What would invalidate the idea?" /></label><label className="sp-label">Review & lesson<textarea name="lesson" className="sp-input min-h-36" maxLength={3000} value={draft.lesson ?? ""} onChange={e => change("lesson", e.target.value)} placeholder="What worked? What will you repeat or change?" /></label></div>
      {!entry && <label className="mt-6 flex items-start gap-3 text-sm text-slate-300"><input type="checkbox" name="capture_analysis" defaultChecked={captureAvailable && captureRequested} disabled={!captureAvailable} className="mt-1 size-4 accent-blue-500" /><span>Include the latest available SmartPulse analysis<span className="mt-1 block text-xs leading-5 text-slate-500">{captureAvailable ? "A timestamped copy is saved with your entry. It is a study record, not proof of execution; the latest cached analysis at save time is used." : "Open a market in Intelligence first to make a snapshot available, or save a manual entry."}</span></span></label>}
      {entry?.snapshot && <p className="mt-5 text-xs text-slate-400">The original analysis snapshot is preserved when you edit this entry.</p>}
    </section>
    {state.error && <p role="alert" className="sp-notice">{state.error}</p>}
    <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-xs text-slate-500">Recording an entry does not place a trade.</p><div className="flex gap-3"><Link className="sp-button-secondary" href={entry ? `/journal/${entry.id}` : "/journal"}>Cancel</Link><button disabled={pending} className="sp-button-primary">{pending ? "Saving…" : entry ? "Save changes" : "Save entry"}</button></div></div>
  </form>;
}
export function ArchiveEntry({ entry }: { entry: SavedJournalEntry }) {
  const [state, action, pending] = useActionState(archiveEntry.bind(null, entry.id, !entry.archived), {});
  return <form action={action}>{state.error && <p role="alert" className="sp-notice mb-3">{state.error}</p>}<button disabled={pending} className="sp-button-secondary">{pending ? "Updating…" : entry.archived ? "Restore entry" : "Archive entry"}</button></form>;
}
