import type { SavedJournalEntry } from "./entry-model";

export interface TradeAccounting {
  currency: string;
  quantity: number;
  unitValue: number;
  fees: number;
  exits: { quantity: number; price: number }[];
}

export function validateAccounting(value: unknown): TradeAccounting {
  if (!value || typeof value !== "object")
    throw new Error("Invalid execution accounting.");
  const a = value as TradeAccounting;
  const positive = (n: number) => Number.isFinite(n) && n > 0 && n <= 1e12;
  if (
    !/^[A-Z]{3}$/.test(a.currency) ||
    !positive(a.quantity) ||
    !positive(a.unitValue) ||
    !Number.isFinite(a.fees) ||
    a.fees < 0 ||
    a.fees > 1e12 ||
    !Array.isArray(a.exits) ||
    a.exits.length > 30 ||
    a.exits.some((e) => !e || !positive(e.quantity) || !positive(e.price))
  ) {
    throw new Error(
      "Enter a currency, positive quantity and unit value, nonnegative fees, and valid exits.",
    );
  }
  if (a.exits.reduce((sum, e) => sum + e.quantity, 0) > a.quantity * (1 + 1e-9))
    throw new Error("Exit quantities exceed the original quantity.");
  return a;
}

export function parseAccounting(form: FormData): TradeAccounting | null {
  if (!String(form.get("quantity") ?? "").trim()) return null;
  const lines = String(form.get("partial_exits") ?? "").trim();
  return validateAccounting({
    currency: String(form.get("currency") ?? "")
      .trim()
      .toUpperCase(),
    quantity: Number(form.get("quantity")),
    unitValue: Number(form.get("unit_value")),
    fees: Number(form.get("fees") ?? 0),
    exits: lines
      ? lines.split(/\r?\n/).map((line) => {
          const values = line.split(",").map((value) => Number(value.trim()));
          if (values.length !== 2)
            throw new Error("Use one quantity,price pair per exit line.");
          return { quantity: values[0], price: values[1] };
        })
      : [],
  });
}

export function executionResult(entry: SavedJournalEntry) {
  if (
    !entry.accounting ||
    entry.entry_price === null ||
    entry.stop_loss === null ||
    entry.status === "planned"
  )
    return null;
  let a: TradeAccounting;
  try {
    a = validateAccounting(entry.accounting);
  } catch {
    return null;
  }
  const exits = a.exits.length
    ? a.exits
    : entry.status === "closed" && entry.exit_price !== null
      ? [{ quantity: a.quantity, price: entry.exit_price }]
      : [];
  const exited = exits.reduce((s, e) => s + e.quantity, 0);
  const gross = exits.reduce(
    (s, e) =>
      s +
      (e.price - entry.entry_price!) *
        e.quantity *
        a.unitValue *
        (entry.direction === "buy" ? 1 : -1),
    0,
  );
  const initialRisk =
    Math.abs(entry.entry_price - entry.stop_loss) * a.quantity * a.unitValue;
  const net = gross - a.fees;
  if (![gross, net, initialRisk].every(Number.isFinite) || initialRisk <= 0)
    return null;
  if (
    entry.status === "closed" &&
    Math.abs(exited - a.quantity) > a.quantity * 1e-9
  )
    return null;
  return {
    currency: a.currency,
    gross,
    net,
    initialRisk,
    netR: net / initialRisk,
    exited,
    remaining: Math.max(0, a.quantity - exited),
  };
}
