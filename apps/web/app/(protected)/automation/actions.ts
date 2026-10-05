"use server";
import { revalidatePath } from "next/cache";
import { tradingActor, tradingAdmin, paperEnabled } from "@/lib/trading/server";
import { findInstrument } from "@/lib/market/market-universe";
import { MarketRepository } from "@/lib/repositories/market";
import { MarketAvailabilityService } from "@/lib/market-session/market-availability-service";
import { monitorPaperAccount } from "@/lib/trading/monitor";
import { AnalysisCacheService } from "@/lib/analysis-cache";
import { qualifySetup } from "@/lib/trading/qualification";

type State = { error?: string; success?: string };
function refreshTrading() {
  revalidatePath("/automation");
  revalidatePath("/journal");
}
function failure(): State {
  return {
    error:
      "The action could not be completed. Check account status, permitted markets, risk limits and storage configuration.",
  };
}

export async function configurePaper(
  _previous: State,
  form: FormData,
): Promise<State> {
  try {
    const enabled = form.get("enabled") === "on",
      stopped = form.get("stop") === "yes";
    const { user } = await tradingActor(!stopped);
    const admin = tradingAdmin();
    if (enabled && !stopped && !paperEnabled())
      return {
        error:
          "Paper entries are disabled by the deployment. Your existing positions can still be monitored.",
      };
    if (stopped) {
      const { error } = await admin.rpc("stop_paper_account", {
        p_user: user.id,
      });
      if (error) return failure();
      refreshTrading();
      return {
        success: "Emergency stop active. Existing positions remain monitored.",
      };
    }
    const symbols = form.getAll("symbols").map(String);
    const risk = Number(form.get("risk_percent"));
    if (
      !Number.isFinite(risk) ||
      risk < 0.1 ||
      risk > 1 ||
      !symbols.length ||
      symbols.length > 8 ||
      symbols.some((symbol) => findInstrument(symbol)?.quoteAsset !== "USD")
    )
      return {
        error: "Choose 1–8 USD-quoted markets and a risk between 0.1% and 1%.",
      };
    const { error } = await admin.rpc("configure_paper_account", {
      p_user: user.id,
      p_enabled: enabled,
      p_stopped: stopped,
      p_risk: risk,
      p_symbols: symbols,
    });
    if (error) return failure();
    refreshTrading();
    return {
      success: stopped
        ? "Emergency stop active. No new paper entries."
        : "Paper settings saved.",
    };
  } catch {
    return failure();
  }
}
export async function submitPaper(
  _previous: State,
  form: FormData,
): Promise<State> {
  try {
    const { user } = await tradingActor();
    if (!paperEnabled())
      return { error: "Paper entries are disabled by the deployment." };
    if (form.get("consent") !== "on")
      return { error: "Confirm this is a synthetic paper rehearsal." };
    const instrument = findInstrument(String(form.get("symbol")));
    if (!instrument?.enabled || instrument.quoteAsset !== "USD")
      return { error: "Choose a supported USD-quoted paper market." };
    if (!MarketAvailabilityService.current(instrument.symbol).isOpen)
      return { error: "This market is currently closed." };
    const direction = String(form.get("direction"));
    const stop = Number(form.get("stop")),
      target = Number(form.get("target"));
    const key = String(form.get("request_id"));
    if (
      !["buy", "sell"].includes(direction) ||
      ![stop, target].every((n) => Number.isFinite(n) && n > 0 && n < 1e12) ||
      !/^[0-9a-f-]{36}$/i.test(key)
    )
      return { error: "Enter a valid stop, target and request identifier." };
    const [quote] = await MarketRepository.getQuotes([instrument.symbol]);
    const age = Date.now() - Date.parse(quote.timestamp);
    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > 120_000 ||
      !Number.isFinite(quote.price) ||
      quote.price <= 0
    )
      return {
        error:
          "A fresh reference quote is unavailable. No paper trade was created.",
      };
    const entry = quote.price;
    const snapshot = AnalysisCacheService.getLive(instrument.symbol);
    const qualification = qualifySetup(
      snapshot?.setup ?? null,
      snapshot?.generatedAt ?? null,
    );
    const admin = tradingAdmin();
    const { error } = await admin.rpc("execute_paper_trade", {
      p_user: user.id,
      p_key: key,
      p_symbol: instrument.symbol,
      p_direction: direction,
      p_entry: entry,
      p_stop: stop,
      p_target: target,
      p_reasoning: {
        source: "manual_paper_rehearsal",
        quoteAt: quote.timestamp,
        fillModel: "reference price; spread/slippage unavailable",
        qualification,
        automated: false,
        unitModel: "USD 1 per price point per synthetic unit",
      },
    });
    if (error) {
      await admin
        .from("automation_events")
        .insert({
          user_id: user.id,
          kind: "paper_rejected",
          message:
            "Paper rehearsal rejected by account, duplicate exposure or protected-risk validation.",
        });
      return {
        error:
          "Paper rehearsal rejected. Check that paper mode is enabled, the market is allowed, the stop is protective, the target is at least 2R, and account limits are available.",
      };
    }
    refreshTrading();
    return {
      success:
        "Paper rehearsal recorded and added to your journal. Repeating this request will not create a second position.",
    };
  } catch {
    return failure();
  }
}
export async function closePaper(
  _previous: State,
  form: FormData,
): Promise<State> {
  try {
    const { user } = await tradingActor(false);
    const admin = tradingAdmin();
    const { data: position, error } = await admin
      .from("trade_intents")
      .select("id,symbol,direction")
      .eq("user_id", user.id)
      .eq("id", String(form.get("intent")))
      .eq("state", "filled")
      .maybeSingle();
    if (error || !position) return { error: "Open paper position not found." };
    const [quote] = await MarketRepository.getQuotes([position.symbol]);
    const age = Date.now() - Date.parse(quote.timestamp);
    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > 120_000 ||
      !Number.isFinite(quote.price) ||
      quote.price <= 0
    )
      return {
        error: "A fresh quote is required to close this paper position.",
      };
    const { error: closeError } = await admin.rpc("close_paper_trade", {
      p_user: user.id,
      p_intent: position.id,
      p_price: quote.price,
      p_reason: "manual",
    });
    if (closeError) return failure();
    refreshTrading();
    return { success: "Paper position closed and journal updated." };
  } catch {
    return failure();
  }
}
export async function refreshPaper(_previous: State): Promise<State> {
  void _previous;
  try {
    const { user } = await tradingActor(false);
    const admin = tradingAdmin();
    const { data, error } = await admin
      .from("trading_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "paper")
      .maybeSingle();
    if (error || !data) return { error: "Configure a paper account first." };
    await monitorPaperAccount(admin, data.id, user.id);
    refreshTrading();
    return {
      success: "Paper positions checked against available closed candles.",
    };
  } catch {
    return {
      error:
        "Monitoring could not complete. New entries are blocked if price history is incomplete.",
    };
  }
}
