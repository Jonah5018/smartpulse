import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { requireTrader } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
export default async function BillingPage() {
  const { profile } = await requireTrader();
  return <DashboardShell profile={profile}><div className="mx-auto max-w-5xl space-y-7"><PageHeading eyebrow="Account" title="Billing" description="Your subscription and payment information will live here." /><section className="sp-panel"><div className="mb-5 inline-flex rounded-2xl bg-blue-500/10 p-4 text-blue-400"><CreditCard size={26} /></div><h2 className="text-2xl font-semibold">Payments are not enabled yet</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">SmartPulse does not currently have a connected checkout or verified subscription record. A paid plan, renewal date or invoice cannot be shown until billing is integrated.</p><div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4"><ShieldCheck size={20} className="shrink-0 text-teal-400" /><p className="text-sm text-slate-300">There is no payment action on this page. Your trading workspace remains available.</p></div><div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard" className="sp-button-primary">Back to workspace</Link><Link href="/settings" className="sp-button-secondary">Account settings</Link></div></section></div></DashboardShell>;
}
