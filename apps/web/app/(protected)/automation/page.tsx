import Link from "next/link";
import { randomUUID } from "node:crypto";
import { requireTrader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveEntitlement } from "@/lib/billing/entitlement";
import { tradingCapabilities } from "@/lib/trading/capabilities";
import { tradingConfigured, paperEnabled } from "@/lib/trading/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
import {
  PaperSettings,
  PaperOrderForm,
  ClosePaper,
  RefreshPaper,
} from "@/components/trading/paper-controls";

export default async function AutomationPage() {
  const { user, profile } = await requireTrader();
  const client = await createClient();
  const entitlement = await getEffectiveEntitlement(client);
  const eligible = tradingCapabilities(entitlement.effectivePlan).paperTrading;
  const [accounts, positions, events] = await Promise.all([
    client
      .from("trading_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "paper")
      .maybeSingle(),
    client
      .from("trade_intents")
      .select("*")
      .eq("user_id", user.id)
      .order("opened_at", { ascending: false })
      .limit(50),
    client
      .from("automation_events")
      .select("id,kind,message,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const account = accounts.data;
  const open = (positions.data ?? []).filter((p) => p.state === "filled");
  const ready = tradingConfigured() && !accounts.error;
  return (
    <DashboardShell profile={profile}>
      <div className="space-y-7">
        <PageHeading
          eyebrow="Permissions before execution"
          title="Trading workspace"
          description="Paper-first practice, protected risk and a visible audit trail. Live trading is unavailable."
          actions={<span className="sp-badge">Paper preview</span>}
        />
        {!eligible && (
          <p className="sp-notice">
            Paper trading requires an active Pro or Elite plan.{" "}
            <Link href="/billing" className="underline">
              Review access
            </Link>
            .
          </p>
        )}
        {(!tradingConfigured() || accounts.error) && (
          <p className="sp-notice">
            Trading storage needs its database migration and server
            configuration before controls can be used. Research and your
            existing journal remain available.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Mode",
              account?.enabled && !account?.stopped
                ? "Paper · manual approval"
                : "Analysis only",
            ],
            [
              "Paper balance",
              account
                ? Number(account.balance).toFixed(2) + " USD"
                : "Not created",
            ],
            [
              "Open paper risk",
              positions.error
                ? "Unavailable"
                : open.reduce((s, p) => s + Number(p.risk), 0).toFixed(2) +
                  " USD",
            ],
            ["MT5 bridge", "Not connected"],
          ].map(([label, value]) => (
            <div key={label} className="sp-panel">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-3 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <section className="sp-panel">
          <h2 className="font-semibold">Execution readiness</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <p className="text-sm text-slate-400">
              <span className="mb-2 block text-teal-300">
                Available in this preview
              </span>
              Manual paper rehearsals, bounded account risk, position
              monitoring, journal records and auditing.
            </p>
            <p className="text-sm text-slate-400">
              <span className="mb-2 block text-amber-300">
                Automatic setup entries blocked
              </span>
              Intraday event timestamps and complete news coverage must be
              verified before automated qualification may lead to execution.
            </p>
            <p className="text-sm text-slate-400">
              <span className="mb-2 block text-slate-200">
                MT5 through MetaApi
              </span>
              Demo verification is being prepared. No password collection or
              live order submission. A restricted bridge token and an existing
              demo account are required.
            </p>
          </div>
        </section>
        {account?.monitoring_error && (
          <p role="alert" className="sp-notice">
            {account.monitoring_error}
          </p>
        )}
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <PaperSettings
            key={account?.enabled + ":" + account?.stopped}
            account={account}
            available={ready}
          />
          <PaperOrderForm
            requestId={randomUUID()}
            available={
              ready &&
              eligible &&
              paperEnabled() &&
              account?.enabled &&
              !account?.stopped
            }
          />
        </div>
        <section className="sp-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Paper positions</h2>
              <p className="mt-2 text-xs text-slate-400">
                Last check:{" "}
                {account?.last_checked_at
                  ? new Date(account.last_checked_at).toUTCString()
                  : "Not checked"}
                . Closing the browser does not schedule a worker; a server
                scheduler must call the protected worker endpoint.
              </p>
            </div>
            {ready && <RefreshPaper />}
          </div>
          <div className="mt-5 space-y-4">
            {positions.error ? (
              <p className="sp-notice">Position history unavailable.</p>
            ) : !positions.data?.length ? (
              <p className="text-sm text-slate-500">
                No paper trades recorded yet.
              </p>
            ) : (
              positions.data.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 p-4"
                >
                  <div>
                    <Link
                      href={"/journal/" + p.journal_id}
                      className="font-semibold text-teal-200"
                    >
                      {p.symbol} · {p.direction}
                    </Link>
                    <p className="mt-2 text-xs text-slate-400">
                      {p.state} · entry {p.entry} · stop {p.stop} · target{" "}
                      {p.target}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {p.quantity} synthetic units · risk{" "}
                      {Number(p.risk).toFixed(2)} USD
                      {p.realized_pnl !== null
                        ? " · P/L " + Number(p.realized_pnl).toFixed(2) + " USD"
                        : ""}
                    </p>
                  </div>
                  {p.state === "filled" && ready && <ClosePaper id={p.id} />}
                </div>
              ))
            )}
          </div>
        </section>
        <section className="sp-panel">
          <h2 className="text-lg font-semibold">Recent audit events</h2>
          <div className="mt-4 space-y-4">
            {events.error ? (
              <p className="text-sm text-slate-400">
                Audit history unavailable.
              </p>
            ) : events.data?.length ? (
              events.data.map((e) => (
                <div key={e.id}>
                  <p className="text-sm text-slate-300">{e.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(e.created_at).toUTCString()} ·{" "}
                    {e.kind.replaceAll("_", " ")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Your configuration and execution events will appear here.
              </p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
