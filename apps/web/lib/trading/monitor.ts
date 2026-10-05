import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MarketRepository } from "@/lib/repositories/market";
import { paperExit } from "./paper";
import { paperHistoryWindow } from "./paper-history";
import { MarketAvailabilityService } from "@/lib/market-session/market-availability-service";

export async function monitorPaperAccount(
  client: SupabaseClient,
  accountId: string,
  userId: string,
) {
  const { data: positions, error } = await client
    .from("trade_intents")
    .select("*")
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .eq("state", "filled");
  if (error) throw new Error("Paper monitoring unavailable.");
  let incomplete = false;
  for (const p of positions ?? []) {
    try {
      const history = await MarketRepository.getCandles(p.symbol, "15min", 200);
      const after = Date.parse(p.checked_through);
      const candles = paperHistoryWindow(
        history,
        after,
        Date.now(),
        (time) =>
          MarketAvailabilityService.current(p.symbol, new Date(time)).status ===
          "closed",
      );
      const exit = paperExit(
        {
          symbol: p.symbol,
          direction: p.direction,
          entry: Number(p.entry),
          stop: Number(p.stop),
          target: Number(p.target),
        },
        candles,
      );
      if (exit) {
        const { error: closeError } = await client.rpc("close_paper_trade", {
          p_user: userId,
          p_intent: p.id,
          p_price: exit.price,
          p_reason: exit.reason,
        });
        if (closeError) throw new Error("Paper closing failed.");
      } else if (candles.length) {
        const { error: updateError } = await client
          .from("trade_intents")
          .update({
            checked_through: new Date(
              Date.parse(candles.at(-1)!.timestamp) + 900_000,
            ).toISOString(),
          })
          .eq("id", p.id)
          .eq("user_id", userId)
          .eq("state", "filled")
          .eq("checked_through", p.checked_through);
        if (updateError) throw new Error("Paper checkpoint failed.");
      }
    } catch {
      incomplete = true;
    }
  }
  const { error: statusError } = await client
    .from("trading_accounts")
    .update({
      last_checked_at: new Date().toISOString(),
      monitoring_error: incomplete
        ? "Price history is unavailable or incomplete. New entries are paused until monitoring recovers."
        : null,
    })
    .eq("id", accountId)
    .eq("user_id", userId);
  if (statusError || incomplete)
    throw new Error("Paper monitoring needs attention.");
}
