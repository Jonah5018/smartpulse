"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
export function AnalysisFreshness({ generatedAt, historical }: { generatedAt: string | null; historical: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => { const update = () => setNow(Date.now()); update(); const timer = setInterval(update, 30000); return () => clearInterval(timer); }, []);
  const age = generatedAt && now ? Math.max(0, Math.floor((now - Date.parse(generatedAt)) / 60000)) : null;
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-4 text-xs text-slate-400"><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><span className={historical || (age !== null && age >= 5) ? "text-amber-300" : "text-teal-300"}>{historical ? "Historical study" : !generatedAt ? "Analysis unavailable" : age !== null && age >= 5 ? "Refresh recommended" : "Analysis available"}</span><span>{generatedAt ? `Generated ${new Date(generatedAt).toUTCString()}` : "No analysis timestamp"}</span><span>Prices & candles: Twelve Data</span></div><button className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-slate-300 hover:bg-slate-800 disabled:opacity-50" disabled={pending} onClick={() => startTransition(() => router.refresh())}><RefreshCw size={13} className={pending ? "animate-spin" : ""} />{pending ? "Refreshing…" : "Refresh"}</button></div>;
}
