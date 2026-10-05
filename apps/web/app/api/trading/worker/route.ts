import { timingSafeEqual } from "node:crypto";
import { tradingAdmin, tradingConfigured } from "@/lib/trading/server";
import { monitorPaperAccount } from "@/lib/trading/monitor";
import { observeAlerts } from "@/lib/alerts/observe";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const secret = process.env.SMARTPULSE_WORKER_SECRET;
  const received = request.headers.get("authorization") ?? "";
  const expected = "Bearer " + secret;
  if (
    !secret ||
    secret.length < 32 ||
    Buffer.byteLength(received) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!tradingConfigured())
    return Response.json(
      { error: "Storage is not configured" },
      { status: 503 },
    );
  const client = tradingAdmin();
  const { data, error } = await client.rpc("claim_paper_monitor");
  if (error)
    return Response.json(
      { error: "Worker storage unavailable" },
      { status: 503 },
    );
  let monitored = 0,
    failed = 0;
  for (const account of data ?? []) {
    try {
      await monitorPaperAccount(client, account.id, account.user_id);
      monitored++;
    } catch {
      failed++;
    } finally {
      await client
        .from("trading_accounts")
        .update({ lease_until: null })
        .eq("id", account.id);
    }
  }
  let alerts = { checked: 0, unavailable: 0 };
  try {
    alerts = await observeAlerts(client);
  } catch {
    alerts.unavailable++;
  }
  // Counts only: no credentials, identities or transport errors in logs.
  console.info("smartpulse.worker", {
    monitored,
    failed,
    alertsChecked: alerts.checked,
    alertsUnavailable: alerts.unavailable,
  });
  return Response.json(
    { monitored, failed, alerts },
    { status: failed ? 503 : 200 },
  );
}
