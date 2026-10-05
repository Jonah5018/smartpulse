"use client";
import { useActionState } from "react";
import { saveAlert, checkAlerts } from "@/app/(protected)/alerts/actions";
export function AlertControls({
  symbols,
  available,
}: {
  symbols: string[];
  available: boolean;
}) {
  const [state, action, pending] = useActionState(saveAlert, {});
  const [check, checkAction, checking] = useActionState(checkAlerts, {});
  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <form action={action} className="sp-panel space-y-4">
        <h2 className="font-semibold">Watch a market state</h2>
        <label className="sp-label">
          Market
          <select name="symbol" className="sp-input">
            {symbols.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex gap-3 text-sm">
          <input name="enabled" type="checkbox" defaultChecked />
          Enable alerts for this market
        </label>
        <p className="text-xs text-slate-500">
          Save with the checkbox cleared to pause an existing rule.
        </p>
        <button disabled={!available || pending} className="sp-button-primary">
          {pending ? "Saving…" : "Save alert rule"}
        </button>
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
      </form>
      <form action={checkAction} className="sp-panel space-y-4">
        <h2 className="font-semibold">Check for changes</h2>
        <p className="text-sm leading-6 text-slate-400">
          Checks up to three enabled rules per run, starting with the oldest
          observations. You receive an in-app event when the setup state,
          direction or invalidation status changes.
        </p>
        <button
          disabled={!available || checking}
          className="sp-button-secondary"
        >
          {checking ? "Checking market evidence…" : "Check alerts now"}
        </button>
        {check.error && (
          <p role="alert" className="sp-notice">
            {check.error}
          </p>
        )}
        {check.success && (
          <p role="status" className="text-sm text-teal-300">
            {check.success}
          </p>
        )}
      </form>
    </div>
  );
}
