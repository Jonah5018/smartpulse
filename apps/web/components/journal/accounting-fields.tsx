"use client";
import { useState } from "react";
import type { TradeAccounting } from "@/lib/journal/accounting";

export function AccountingFields({
  value,
}: {
  value?: TradeAccounting | null;
}) {
  const [draft, setDraft] = useState({
    quantity: value?.quantity?.toString() ?? "",
    unit_value: value?.unitValue?.toString() ?? "",
    currency: value?.currency ?? "USD",
    fees: value?.fees?.toString() ?? "0",
    partial_exits:
      value?.exits.map((e) => e.quantity + "," + e.price).join("\n") ?? "",
  });
  return (
    <section className="sp-panel">
      <input type="hidden" name="accounting_present" value="1" />
      <h2 className="text-lg font-semibold">
        Execution accounting{" "}
        <span className="text-xs font-normal text-slate-500">Optional</span>
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Add your actual quantity and account-currency value per 1.0 price move
        per quantity unit. Obtain this from your contract specification or
        broker; lot sizes and currency conversions differ between markets. Leave
        quantity blank for price-only R.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["quantity", "Original quantity"],
            ["unit_value", "Value per price unit"],
            ["currency", "Account currency"],
            ["fees", "Total fees / costs"],
          ] as const
        ).map(([name, label]) => (
          <label key={name} className="sp-label">
            {label}
            <input
              name={name}
              className="sp-input"
              type={name === "currency" ? "text" : "number"}
              step={name === "currency" ? undefined : "any"}
              min={name === "fees" ? 0 : 0.00000001}
              maxLength={name === "currency" ? 3 : undefined}
              value={draft[name]}
              onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <label className="sp-label mt-5">
        Partial exits · one quantity,price pair per line
        <textarea
          name="partial_exits"
          className="sp-input min-h-24 font-mono"
          value={draft.partial_exits}
          onChange={(e) =>
            setDraft({ ...draft, partial_exits: e.target.value })
          }
          placeholder={"0.5,1.1020\n0.5,1.1050"}
          maxLength={2000}
        />
      </label>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        For closed trades, exits must total the original quantity and the exit
        price above must match their weighted average. Leave exits blank to use
        a single closing fill. Fees are total recorded costs in the selected
        account currency.
      </p>
    </section>
  );
}
