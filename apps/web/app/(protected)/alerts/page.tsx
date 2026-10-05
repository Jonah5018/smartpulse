import Link from "next/link";
import { requireTrader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveEntitlement } from "@/lib/billing/entitlement";
import { marketsForPlan } from "@/lib/billing/market-access";
import { tradingConfigured } from "@/lib/trading/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
import { AlertControls } from "@/components/alerts/alert-controls";

export default async function AlertsPage() {
  const { user, profile } = await requireTrader();
  const client = await createClient();
  const entitlement = await getEffectiveEntitlement(client);
  const [rules, events] = await Promise.all([
    client
      .from("market_alert_rules")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    client
      .from("market_alert_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  return (
    <DashboardShell profile={profile}>
      <div className="space-y-7">
        <PageHeading
          eyebrow="Follow what changes"
          title="Market alerts"
          description="A durable record of setup changes and invalidations in the markets you choose."
        />
        <p className="sp-notice">
          Checks run when you request them, or when the protected server worker
          is called by a configured scheduler. An enabled rule alone does not
          mean background monitoring is running. Alerts appear here; no email or
          push delivery is enabled.
        </p>
        {(!tradingConfigured() || rules.error) && (
          <p className="sp-notice">
            Alert storage is not ready. Apply the database migration and
            configure the server credential.
          </p>
        )}
        {!entitlement.canUsePro && (
          <p className="sp-notice">
            Market state alerts require Pro or Elite access.{" "}
            <Link href="/billing" className="underline">
              Review plans
            </Link>
            .
          </p>
        )}
        <AlertControls
          symbols={marketsForPlan(entitlement.effectivePlan).map(
            (i) => i.symbol,
          )}
          available={
            tradingConfigured() && !rules.error && entitlement.canUsePro
          }
        />
        <section className="sp-panel">
          <h2 className="font-semibold">Your alert rules</h2>
          <div className="mt-5 space-y-3">
            {rules.data?.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap justify-between gap-3 border-b border-slate-800 pb-3 text-sm"
              >
                <span>
                  {r.symbol} · {r.enabled ? "Enabled" : "Paused"}
                </span>
                <span className="text-xs text-slate-400">
                  {r.last_state?.replaceAll("_", " ").replaceAll(":", " · ") ??
                    "Awaiting first observation"}
                </span>
              </div>
            ))}
            {!rules.error && !rules.data?.length && (
              <p className="text-sm text-slate-500">
                Choose a market above to create your first rule.
              </p>
            )}
          </div>
        </section>
        <section className="sp-panel">
          <h2 className="font-semibold">Recent changes</h2>
          <div className="mt-5 space-y-5">
            {events.error ? (
              <p className="text-sm text-slate-400">
                Alert history unavailable.
              </p>
            ) : events.data?.length ? (
              events.data.map((e) => (
                <article key={e.id}>
                  <Link
                    className="font-medium text-teal-300"
                    href={
                      "/intelligence?symbol=" + encodeURIComponent(e.symbol)
                    }
                  >
                    {e.symbol}
                  </Link>
                  <p className="mt-2 text-sm text-slate-300">
                    {e.previous_state
                      .replaceAll("_", " ")
                      .replaceAll(":", " · ")}{" "}
                    →{" "}
                    {e.current_state
                      .replaceAll("_", " ")
                      .replaceAll(":", " · ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Observed {new Date(e.observed_at).toUTCString()}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No state changes recorded yet. The first check establishes the
                baseline.
              </p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
