import Link from "next/link";
import { requireTrader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
import { realizedR, type SavedJournalEntry } from "@/lib/journal/entry-model";
import { executionResult } from "@/lib/journal/accounting";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const mode = (await searchParams).mode === "paper" ? "paper" : "manual";
  const { user, profile } = await requireTrader();
  const client = await createClient();
  const { data, error, count } = await client
    .from("journal_entries")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("archived", false)
    .eq("execution_mode", mode)
    .eq("status", "closed")
    .order("trade_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(1000);
  const entries = (data ?? []) as SavedJournalEntry[];
  const priceResults = entries
    .map(realizedR)
    .filter((n): n is number => n !== null && Number.isFinite(n));
  const cashResults = entries
    .map(executionResult)
    .filter((r): r is NonNullable<typeof r> => r !== null);
  const currencies = [...new Set(cashResults.map((r) => r.currency))];
  const netRs = cashResults.map((r) => r.netR);
  return (
    <DashboardShell profile={profile}>
      <div className="space-y-7">
        <Link href="/journal" className="text-sm text-slate-400">
          ← Journal
        </Link>
        <PageHeading
          eyebrow="Review your process"
          title="Performance review"
          description="Outcomes from your recorded trades. Costs, partial exits and data coverage remain visible."
        />
        {error ? (
          <p className="sp-notice">
            Journal analytics are temporarily unavailable. No results have been
            estimated.
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              Sample: latest {entries.length} of {count ?? 0} non-archived
              closed entries · {cashResults.length} include complete execution
              accounting. Mode: {mode}. Manual and paper results are kept
              separate.
            </p>
            <div className="flex gap-3">
              <Link className="sp-button-secondary" href="/journal/analytics">
                Manual trades
              </Link>
              <Link
                className="sp-button-secondary"
                href="/journal/analytics?mode=paper"
              >
                Paper trades
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Recorded trades", entries.length],
                [
                  "Price-only average R",
                  priceResults.length
                    ? (
                        priceResults.reduce((s, r) => s + r, 0) /
                        priceResults.length
                      ).toFixed(2) + "R"
                    : "—",
                ],
                [
                  "Net average R",
                  netRs.length
                    ? (netRs.reduce((s, r) => s + r, 0) / netRs.length).toFixed(
                        2,
                      ) + "R"
                    : "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className="sp-panel">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-3 text-3xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <section className="sp-panel">
              <h2 className="text-lg font-semibold">
                Net results by account currency
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Currencies are never added together. Net R includes your
                recorded fees; price-only R excludes costs.
              </p>
              {!currencies.length ? (
                <p className="mt-6 text-sm text-slate-500">
                  Add execution accounting to a closed journal entry to see net
                  results.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {currencies.map((currency) => {
                    const rows = cashResults.filter(
                      (r) => r.currency === currency,
                    );
                    const net = rows.reduce((s, r) => s + r.net, 0);
                    const gains = rows.reduce(
                      (s, r) => s + Math.max(0, r.net),
                      0,
                    );
                    const losses = rows.reduce(
                      (s, r) => s + Math.max(0, -r.net),
                      0,
                    );
                    return (
                      <div
                        key={currency}
                        className="rounded-xl border border-slate-800 p-5"
                      >
                        <p className="text-xs text-slate-400">
                          {currency} · {rows.length} trades
                        </p>
                        <p
                          className={
                            "mt-3 text-2xl font-semibold " +
                            (net >= 0 ? "text-teal-300" : "text-rose-300")
                          }
                        >
                          {net.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          {currency}
                        </p>
                        <p className="mt-3 text-xs text-slate-400">
                          Win rate:{" "}
                          {(
                            (rows.filter((r) => r.net > 0).length /
                              rows.length) *
                            100
                          ).toFixed(1)}
                          % · Profit factor:{" "}
                          {losses
                            ? (gains / losses).toFixed(2)
                            : "— (no recorded losses)"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            <section className="sp-panel">
              <h2 className="font-semibold">Recent outcomes</h2>
              <div className="mt-4 divide-y divide-slate-800">
                {entries.slice(0, 30).map((entry) => {
                  const result = executionResult(entry);
                  return (
                    <Link
                      key={entry.id}
                      href={"/journal/" + entry.id}
                      className="flex flex-wrap justify-between gap-3 py-4 text-sm"
                    >
                      <span>
                        {entry.symbol}{" "}
                        <span className="text-xs text-slate-500">
                          {entry.trade_date}
                        </span>
                      </span>
                      <span className="font-mono">
                        {result
                          ? result.net.toFixed(2) +
                            " " +
                            result.currency +
                            " · " +
                            result.netR.toFixed(2) +
                            "R"
                          : "Price-only: " +
                            (realizedR(entry)?.toFixed(2) ?? "—") +
                            "R"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
