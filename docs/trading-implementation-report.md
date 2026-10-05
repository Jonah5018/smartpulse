# SmartPulse implementation and preview guide

Updated: 1 October 2026

## Delivery status

The research workspace improvements and a durable, manually approved paper-trading preview are implemented. The full automated brokerage product is not complete or enabled. No real broker order has been submitted, no broker credentials are stored, and no worker schedule has been deployed.

The earlier repository assessment is in `docs/trading-architecture-assessment.md`. Existing authentication, profile/onboarding guards, billing entitlements, canonical instruments, market repository, analysis engines, journal and legal routes were reused. No duplicate market-data provider was added.

## Preview locally

The earlier preview returned successful HTTP responses, but the server was no longer running at handoff. Restarting it from the agent environment failed with Windows `spawn EPERM`. Run these commands yourself in your VS Code Git Bash terminal:

```bash
cd /c/Users/user/smartpulse/apps/web
npm run dev
```

Open these routes:

| Address                                             | What to review                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| http://localhost:3000/                              | New marketing homepage                                                                  |
| http://localhost:3000/intelligence?symbol=XAU%2FUSD | Annotated candles and prefix-based historical replay, when market evidence is available |
| http://localhost:3000/journal                       | Existing journal with optional quantity, fees and partial exits                         |
| http://localhost:3000/journal/analytics             | Performance review; manual and paper results are separate                               |
| http://localhost:3000/alerts                        | Saved market-state alerts and on-demand checks                                          |
| http://localhost:3000/automation                    | Paper settings, rehearsals, positions, monitoring and audit events                      |

Private routes require a normal authenticated account. Trading entries require an active Pro or Elite entitlement from the existing billing system. Do not modify subscription checks to bypass access.

### Paper preview configuration

The server-only Supabase service key is configured locally and belongs to the SmartPulse project. Do not copy it into browser code, documentation, Git or chat.

Paper entries are disabled by default. To enable this deployment's simulated entry controls, add the following to `apps/web/.env.local`, then restart the development server:

```dotenv
SMARTPULSE_PAPER_ENABLED=true
```

Each user must still explicitly enable their own paper account, select permitted USD-quoted instruments and risk, and approve each rehearsal. This flag cannot enable real trading. A new account starts with a synthetic USD 10,000 balance. Emergency stop prevents new entries; it does not liquidate existing positions. Existing positions can still be monitored or manually closed after an entitlement expires.

### Background processing

On-demand checks work without a scheduler. For unattended monitoring, a deployment needs an external scheduler sending authenticated POST requests to `/api/trading/worker`. Set `SMARTPULSE_WORKER_SECRET` to a securely generated secret of at least 32 characters in both the server and scheduler secret store. Send it as `Authorization: Bearer <secret>`; never put it in a URL or browser script.

The endpoint leases one paper account for monitoring and checks up to three alert rules per invocation. Deployment cadence and capacity must be measured against account count and provider quotas. Configure retry/backoff, failures, alerts and stale-monitor detection before relying on it unattended. No such schedule is currently configured. The endpoint returns 401 without valid authentication.

## Implemented behavior

- Marketing homepage: responsive layout, product explanation, illustrative chart, research workflow, FAQ and existing legal/auth links. It makes no invented performance or customer claims.
- Annotated charts: closed candles from the existing analysis response; structure, zones, imbalances and liquidity evidence. Replay recalculates evidence using only candles available at the selected point. It is single-timeframe educational replay, not a multi-timeframe strategy backtest.
- Journal: optional account-currency quantity/unit value, aggregate fees and partial exits; quantity and weighted exit validation; net P/L and net R. Analytics separates currencies and execution modes and reports accounting coverage.
- Alerts: owner-scoped rules, initial baseline, durable deduplicated state-change records, out-of-order observation protection, on-demand and worker checks. No email, SMS or push delivery is implemented.
- Paper execution: authenticated server actions, explicit approval, fresh reference quotes, protective stops, at least 2R targets, permitted markets, atomic risk checks, idempotent requests, automatic journal entries, close/monitor operations and audit events.
- Domain foundation: centralized capabilities, typed qualification, deterministic risk and execution policy, order lifecycle, broker contract, conservative reconciliation decisions and authenticated credential-encryption primitives.

## Database and access controls

Migration: `supabase/migrations/20261001045603_research_and_paper_trading.sql`.

The user applied this migration in SmartPulse's SQL Editor. Remote REST checks confirmed the five new tables, new journal columns, and six execution/configuration/monitoring RPCs are available in project `fcehdfywspwvqmrrzqce`. Anonymous execution access was blocked.

New tables are `trading_accounts`, `trade_intents`, `automation_events`, `market_alert_rules` and `market_alert_events`. Journal entries gain accounting and execution-mode fields. Owner RLS protects user reads. Trading mutations require service-role server operations; authenticated users cannot call the execution RPCs directly. Account locks serialize risk and duplicate checks. Audit records are append-only for application roles. Paper journal financial fields cannot be changed by ordinary authenticated journal edits.

The SQL Editor does not establish that CLI migration history is synchronized. Before a future `supabase db push`, compare the linked project's migration history with the local files and reconcile only versions confirmed as applied. Do not blindly rerun this migration or apply every old migration to the existing database.

## Entitlements, risk and security

Basic has no trading entitlement. Pro has paper/manual/semi-auto capability eligibility, and Elite additionally has future full-auto eligibility. Eligibility alone never enables a broker mode: every non-paper execution mode is currently blocked.

The paper database enforces protective prices, a minimum 2R target, up to two open positions, five entries per day, 1% aggregate initial open risk, 2% daily realized-loss and 5% weekly realized-loss limits, a 10% balance drawdown limit and a cooldown after three recent losses. User paper risk is constrained to 0.1–1% per trade. Initial risk budgets do not guarantee final losses in price gaps. The standalone risk domain also validates broker quantity/tick/margin metadata and rounds quantity down; it does not invent live lot sizes.

Sensitive transport and credential modules are server-only. Encryption uses AES-256-GCM with owner/connection binding and random nonces. This primitive has not been connected to a credential store or onboarding flow. Broker errors are sanitized. No natural-language analysis is used to submit an order. Unknown broker outcomes cannot be blindly resubmitted by the lifecycle/reconciliation foundation.

## Verification

Final automated checks: **173 tests passed across 24 files; zero failed**. TypeScript (`tsc --noEmit`) passed. ESLint passed with zero errors and four pre-existing unused-variable warnings in session-manager, decision-engine, liquidity-analyzer and Supabase middleware. `git diff --check` passed. The local environment file remains ignored by Git.

The database test script is `supabase/tests/research_and_paper_trading.sql`; it was run against disposable PostgreSQL via PGlite, not against real user records. All assertions passed (27 SQL statement results). It covers journal creation/closing, duplicate execution, protected exposure, kill switch, alert deduplication/order, role permissions, ownership and audit immutability. This is not a concurrent load test or a complete independent security audit.

The production build compiled successfully, but the subsequent worker stage failed with `spawn EPERM` in this Windows environment. A complete production build has not been verified. Browser automation lost its debugger connection, so final signed-in mobile/desktop visual checks and real UI form submission remain unverified. HTTP checks confirmed the homepage returns 200, protected preview routes redirect anonymous visitors to login, and the worker rejects unauthenticated requests with 401.

## Known limits and next phase

1. Paper entries use a reference price and synthetic USD-per-point units. They do not model executable bid/ask spreads, commissions, latency, slippage, broker margin or real contract quantities. Monitoring uses completed M15 bars; it excludes the partial entry candle and conservatively chooses the stop when both stop and target occur in one bar. Missing open-market intervals or malformed candles pause new entries. Recovery is bounded by the available 200-bar history and a 14-day checkpoint limit. Broker-specific holiday/session schedules are not verified.
2. Automated setup entries remain blocked because the current calendar does not provide verified complete intraday high-impact event coverage. Manual paper rehearsals record qualification context but are not automatically qualified trading signals.
3. Journal analytics reads the latest 1,000 qualifying entries and does not dynamically convert currencies. User-entered unit value must represent the actual instrument/account convention.
4. The broker interface, credential primitives, read-only MetaApi demo reader and reconciliation domain are foundations. There is no connected MT5 account, broker credential persistence, account connect/disconnect flow, pending broker approval queue, writable adapter, webhook receiver or running broker reconciliation worker.
5. Full end-to-end and concurrent production testing remain necessary. The append-only audit restrictions apply to application roles, not database administrators. Operational key rotation, backups, monitoring/alerts, incident recovery, production rate limits and load tests need a deployment review.
6. Before public live trading, obtain external review of broker permissions, API terms, regional availability, operating-jurisdiction requirements, user agreements and explicit versioned execution consent. This implementation makes no legal-compliance claim.

The next phase is signed-in desktop/mobile acceptance testing of the research and manual paper flows, followed by a verified MT5 **demo-only** connection and deployed monitoring. Live order support should follow only after actual bridge scopes, symbol metadata, protection semantics, idempotency, recovery and reconciliation have been verified against the chosen demo account.

## Bridge documentation reviewed

The read-only transport follows MetaApi's [account-information REST endpoint](https://metaapi.cloud/docs/client/restApi/api/readTradingTerminalState/readAccountInformation/) and [account-information model](https://metaapi.cloud/docs/client/models/metatraderAccountInformation/). It permits only MT5 accounts reported as demo, uses a fixed New York endpoint, disables redirects and returns a small allowlisted DTO. See also [authentication](https://metaapi.cloud/docs/client/restApi/auth/), [symbol specifications](https://metaapi.cloud/docs/client/models/metatraderSymbolSpecification/), [prices](https://metaapi.cloud/docs/client/models/metatraderSymbolPrice/) and [rate limits](https://metaapi.cloud/docs/client/rateLimiting/). These references do not verify the user's token permissions, regional eligibility or the full writable bridge integration.

## File map

- Research: `components/intelligence/annotated-chart.tsx`, `lib/charts/`, and the existing intelligence/setup pipeline.
- Journal: `lib/journal/accounting.ts`, `components/journal/accounting-fields.tsx`, `app/(protected)/journal/analytics/`, and existing entry model/form/actions/detail/list.
- Trading: `lib/trading/`, `components/trading/`, `app/(protected)/automation/`, `app/api/trading/worker/route.ts`.
- Alerts: `lib/alerts/`, `components/alerts/`, `app/(protected)/alerts/`.
- Shared changes: `app/page.tsx`, sidebar, notifications menu and billing entitlement helper.
- Database/docs: migration and SQL tests above, architecture assessment and this report.

No project dependency was added. Existing unrelated user changes were preserved, including deletion of the accidentally nested empty profile repository. Changes are local and have not been committed or pushed as part of this task.
