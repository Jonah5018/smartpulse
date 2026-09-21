# Saved Journal and research workspace

The application lives in `apps/web`. The Journal stores planned ideas and user-recorded executions; it never places broker orders.

## Database setup

`supabase/schema/journal_entries.sql` is the reviewed setup SQL. It was applied to SmartPulse project `fcehdfywspwvqmrrzqce` on 21 September 2026 through the project's SQL Editor. Do not run CREATE TABLE again on that database. Apply the script to a new environment before using Journal there, or incorporate it into that environment's migration workflow.

The CLI could not initialize its local configuration directory in the development environment used for this implementation, so the script is not a CLI-generated migration. Reconcile this applied schema into Supabase migration history before automated database deployments.

Ownership is checked in server actions and by RLS. Anonymous access and permanent deletion are not granted. Entries can be archived and restored. Original snapshots, ownership and creation timestamps are not client-updatable. Run `supabase/tests/journal_ownership.sql` to check ownership in a transaction that rolls back its test identities and records.

## Flow

1. Open Intelligence and select a market.
2. Choose Save to journal to create a planned entry. The form explains which analysis is available. If selected, the latest server-cached snapshot is captured with its generation timestamp at save time; it is not a claim of freshness or trade execution.
3. Add observations. Actual execution prices are required when recording open or closed trades.
4. Revisit the entry to add an exit and review lesson. Price-based R uses the initial stop and excludes fees, position size and partial exits.
5. Filter history by status or exact market symbol. History is paginated in groups of 20. Summary statistics are explicitly scoped to the displayed page where applicable.

Saved snapshots persist in Supabase. The shared live-analysis cache is still in memory, so a server restart can make the capture option unavailable until the market is analyzed again. Saving a manual entry remains possible.

## Validation

From `apps/web`:

```sh
npx tsc --noEmit
npm run lint
npx vitest run --configLoader native --pool threads --maxWorkers 1
npm run build
```

The native loader requires a Node version that supports TypeScript configuration loading. It and the thread worker pool avoid the subprocess startup errors observed on this Windows environment. The default test command remains available for other environments.

Tests cover data availability, macro unknown states, symbol normalization, analysis caching, journal validation and R calculation, and DST-aware session formatting. Browser verification also covered Journal save, reload, edit, snapshot retention, archive and restore. A labeled synthetic QA entry is archived and excluded from the default active-entry view.

Billing is an informative page until a real payment provider and entitlements are connected. No subscription is inferred from the placeholder workspace permission values. Automated notifications are not enabled. Settings uses the existing authenticated profile repository; deployed `full_name` is generated from name fields by the database.
