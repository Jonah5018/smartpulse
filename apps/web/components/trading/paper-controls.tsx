"use client";
import { useActionState } from "react";
import {
  configurePaper,
  submitPaper,
  closePaper,
  refreshPaper,
} from "@/app/(protected)/automation/actions";
const symbols = [
  "EUR/USD",
  "GBP/USD",
  "AUD/USD",
  "NZD/USD",
  "XAU/USD",
  "XAG/USD",
  "BTC/USD",
  "ETH/USD",
];
export function PaperSettings({
  account,
  available,
}: {
  account: {
    enabled: boolean;
    stopped: boolean;
    risk_percent: number;
    allowed_symbols: string[];
  } | null;
  available: boolean;
}) {
  const [state, action, pending] = useActionState(configurePaper, {});
  return (
    <form action={action} className="sp-panel space-y-5">
      <h2 className="text-lg font-semibold">Your paper rules</h2>
      <label className="sp-label">
        Risk per trade (%)
        <input
          className="sp-input"
          name="risk_percent"
          type="number"
          min=".1"
          max="1"
          step=".1"
          defaultValue={account?.risk_percent ?? 0.5}
        />
      </label>
      <fieldset>
        <legend className="mb-3 text-sm text-slate-400">
          Permitted markets
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {symbols.map((symbol) => (
            <label key={symbol} className="flex gap-2 text-sm">
              <input
                name="symbols"
                type="checkbox"
                value={symbol}
                defaultChecked={(
                  account?.allowed_symbols ?? ["EUR/USD", "GBP/USD", "XAU/USD"]
                ).includes(symbol)}
              />
              {symbol}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={account?.enabled ?? false}
          className="mt-1"
        />
        <span>
          Enable manually approved paper rehearsals
          <span className="mt-1 block text-xs text-slate-500">
            Synthetic USD units. No real broker orders.
          </span>
        </span>
      </label>
      <p className="text-xs leading-5 text-slate-500">
        Limits: 2 positions · 5 trades/day · 1% aggregate risk · 2% daily loss
        budget · 5% weekly · 10% drawdown · at least 2R · 24-hour cooldown after
        3 recent losses.
      </p>
      {state.error && (
        <p role="alert" className="sp-notice">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-teal-300">
          {state.success}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button disabled={!available || pending} className="sp-button-primary">
          {pending ? "Saving…" : "Save paper rules"}
        </button>
        <button
          name="stop"
          value="yes"
          disabled={!available || pending}
          className="sp-button-secondary !text-rose-300"
        >
          Emergency stop
        </button>
      </div>
    </form>
  );
}
export function PaperOrderForm({
  requestId,
  available,
}: {
  requestId: string;
  available: boolean;
}) {
  const [state, action, pending] = useActionState(submitPaper, {});
  return (
    <form action={action} className="sp-panel space-y-5">
      <h2 className="text-lg font-semibold">Rehearse a protected trade</h2>
      <p className="text-sm leading-6 text-slate-400">
        A manual practice decision. Entry uses the latest available reference
        price when you submit; the server recalculates size and checks account
        limits. This is not an automatically qualified setup.
      </p>
      <input type="hidden" name="request_id" value={requestId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sp-label">
          Market
          <select name="symbol" className="sp-input">
            {symbols.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="sp-label">
          Direction
          <select name="direction" className="sp-input">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>
        <label className="sp-label">
          Protective stop
          <input
            name="stop"
            className="sp-input"
            type="number"
            step="any"
            min=".00000001"
            required
          />
        </label>
        <label className="sp-label">
          Target
          <input
            name="target"
            className="sp-input"
            type="number"
            step="any"
            min=".00000001"
            required
          />
        </label>
      </div>
      <label className="flex gap-3 text-sm text-slate-300">
        <input type="checkbox" name="consent" required />
        <span>I approve a synthetic paper rehearsal with no real capital.</span>
      </label>
      {state.error && (
        <p role="alert" className="sp-notice">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-teal-300">
          {state.success}
        </p>
      )}
      <button
        disabled={!available || pending || !!state.success}
        className="sp-button-primary"
      >
        {pending ? "Checking limits…" : "Approve paper rehearsal"}
      </button>
      <p className="text-xs leading-5 text-slate-500">
        No spread, commissions or slippage are simulated; reference prices are
        not executable broker quotes. Synthetic quantity is not a broker lot
        size. Monitoring uses completed 15-minute candles starting after entry;
        movement within the entry candle is excluded. Missing history pauses new
        entries. Close/reopen this form for another request.
      </p>
    </form>
  );
}
export function ClosePaper({ id }: { id: string }) {
  const [state, action, pending] = useActionState(closePaper, {});
  return (
    <form action={action}>
      <input type="hidden" name="intent" value={id} />
      <button disabled={pending} className="sp-button-secondary">
        {pending ? "Closing…" : "Close at current quote"}
      </button>
      {state.error && (
        <p className="sp-notice mt-2" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
export function RefreshPaper() {
  const [state, action, pending] = useActionState(refreshPaper, {});
  return (
    <form action={action}>
      <button disabled={pending} className="sp-button-secondary">
        {pending ? "Checking candles…" : "Check paper positions"}
      </button>
      {state.error && (
        <p role="alert" className="sp-notice mt-3">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="mt-3 text-xs text-teal-300">
          {state.success}
        </p>
      )}
    </form>
  );
}
