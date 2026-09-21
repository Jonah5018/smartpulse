import { normalizeMarketSymbol } from "@/lib/market/market-universe";
import type { AITradeJournal } from "@/lib/trade-journal";

export type EntryStatus = "planned" | "open" | "closed";
export interface JournalSnapshot { generatedAt: string; journal: AITradeJournal; focusScore: number | null }
export interface SavedJournalEntry {
  id: string; user_id: string; symbol: string; direction: "buy" | "sell";
  status: EntryStatus; timeframe: string; trade_date: string;
  entry_price: number | null; stop_loss: number | null; take_profit: number | null; exit_price: number | null;
  notes: string; lesson: string; snapshot: JournalSnapshot | null;
  archived: boolean; created_at: string; updated_at: string;
}
export type EntryInput = Pick<SavedJournalEntry, "symbol" | "direction" | "status" | "timeframe" | "trade_date" | "entry_price" | "stop_loss" | "take_profit" | "exit_price" | "notes" | "lesson">;
export type FormState = { error?: string; success?: string };

export function parseEntry(form: FormData): EntryInput {
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const price = (key: string) => {
    if (!text(key)) return null;
    const value = Number(text(key));
    if (!Number.isFinite(value) || value <= 0 || value > 1e12) throw new Error("Prices must be positive numbers below one trillion.");
    return value;
  };
  const symbol = normalizeMarketSymbol(text("symbol"));
  if (!/^[A-Z0-9/._-]{2,20}$/.test(symbol)) throw new Error("Enter a valid market symbol.");
  const direction = text("direction");
  const status = text("status");
  if (direction !== "buy" && direction !== "sell") throw new Error("Choose Buy or Sell.");
  if (status !== "planned" && status !== "open" && status !== "closed") throw new Error("Choose a valid trade status.");
  const trade_date = text("trade_date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trade_date) || !Number.isFinite(Date.parse(trade_date)) || new Date(trade_date).toISOString().slice(0, 10) !== trade_date) throw new Error("Enter a valid trade date.");
  const timeframe = text("timeframe");
  if (!["1min", "5min", "15min", "30min", "1h", "4h", "1day"].includes(timeframe)) throw new Error("Choose a valid timeframe.");
  const entry_price = price("entry_price"), stop_loss = price("stop_loss"), take_profit = price("take_profit"), exit_price = price("exit_price");
  if (status !== "planned" && (entry_price === null || stop_loss === null)) throw new Error("Open and closed trades require an entry and initial stop.");
  if (status === "closed" && exit_price === null) throw new Error("Enter the exit price for a closed trade.");
  if (status !== "closed" && exit_price !== null) throw new Error("Only closed trades can have an exit price.");
  if (entry_price !== null && stop_loss !== null && (direction === "buy" ? stop_loss >= entry_price : stop_loss <= entry_price)) throw new Error("The initial stop must be below a Buy entry or above a Sell entry.");
  if (entry_price !== null && take_profit !== null && (direction === "buy" ? take_profit <= entry_price : take_profit >= entry_price)) throw new Error("The target must be above a Buy entry or below a Sell entry.");
  const notes = text("notes"), lesson = text("lesson");
  if (notes.length > 5000 || lesson.length > 3000) throw new Error("Keep notes under 5,000 characters and lessons under 3,000.");
  return { symbol, direction, status, timeframe, trade_date, entry_price, stop_loss, take_profit, exit_price, notes, lesson };
}

/** Price-based R only; excludes fees, slippage and partial exits. */
export function realizedR(entry: Pick<SavedJournalEntry, "status" | "direction" | "entry_price" | "stop_loss" | "exit_price">): number | null {
  if (entry.status !== "closed" || entry.entry_price === null || entry.stop_loss === null || entry.exit_price === null) return null;
  const risk = Math.abs(entry.entry_price - entry.stop_loss);
  if (!risk) return null;
  return ((entry.exit_price - entry.entry_price) * (entry.direction === "buy" ? 1 : -1)) / risk;
}
