# SmartPulse research workspace and trading architecture assessment

Date: 2026-10-01

## Existing architecture inspected

Authentication is verified through Supabase getUser in lib/auth/require-trader.ts. Profiles and onboarding are already guarded. Subscription authorization comes from lib/billing/entitlement.ts and subscription_entitlements, not editable user metadata. lib/market/market-universe.ts owns canonical instruments and market access. MarketRepository and the provider budget/cache must remain the only market-data transport.

InstitutionalSetupEngine builds closed-candle multi-timeframe context and reuses structure, liquidity, displacement, imbalance, confluence and PriceActionEngine. Its typed output, never its narrative, is the future qualification input. The saved Journal repository has ownership filters, optimistic edits, archive semantics and RLS. Existing SQL cron handles disposable-email-domain synchronization only; no execution worker, broker credentials, order ledger or risk engine exists. Existing analysis caches are process-local and cannot guarantee order idempotency.

## Reuse and extension

- Add bounded candle evidence to the existing setup response for annotated charts; no duplicate provider calls. Replay recomputes detectors on prefixes of closed candles and clearly identifies its single-timeframe educational scope.
- Extend the existing journal with optional execution accounting, retaining old rows. Analytics must report coverage and separate currencies. Never invent FX/contract conversion rates.
- Add owner-scoped alert rules and durable state transitions. Refresh-driven checks must be distinguished from configured background processing.
- Replace the placeholder root route with a responsive marketing page describing available research features and clearly marking execution as a paper-first preview.
- Add independent trading domain modules for capabilities, qualification, risk, policy, lifecycle and broker contracts. Paper execution precedes any real connector.
- First requested connector is MetaTrader 5 through a verified bridge. MetaApi is a candidate to verify against official documentation. SmartPulse must never collect MT5 passwords; use an already provisioned demo account and restricted API token only. Demo verification, symbol mapping, metadata, rates, regional terms and account permission verification precede order support.

## Data and security design

New tables require explicit grants and owner RLS. Trade intents require durable user/account/setup uniqueness. Execution and audit writes must be server-only, with atomic account locking for exposure and duplicate checks. Credentials belong in a private schema, encrypted with server-managed AES-GCM keys and bound to owner/account context. No credential or broker transport response may enter logs or client props. Audit records are append-only to application roles. A pending/ambiguous submission requires reconciliation and must never be blindly retried.

Default mode is analysis only, automation disabled. Pro/Elite capabilities are centralized but never override deployment flags, explicit user permission, account/instrument kill switches, data freshness, news/session checks or risk limits. Existing positions continue monitoring when new entries are paused. Live execution remains unavailable until external operational and legal prerequisites are satisfied.

## Tests and delivery gates

Preserve the existing analysis/auth/journal regression suite. Add causal replay, fee/partial-exit accounting, transition-alert deduplication, entitlement, finite input/quantity rounding, missing metadata, stale data, news windows, loss/aggregate limits, kill switches, order lifecycle and ambiguous response tests. SQL ownership and atomic idempotency tests must run against a disposable database before deployment. Typecheck, lint, build and responsive browser checks are required; report environment blockers honestly.

## Current external dependencies

The connected Supabase plugin does not expose SmartPulse; do not modify the unrelated projects. No verified MT5 demo account/token has been supplied, no worker deployment is configured, and live permissions have not been granted. These dependencies do not prevent implementation of research UI, pure risk logic, migration preparation or paper-first architecture. The accidentally nested empty profile repository has already been deleted by the user; preserve that deletion.
