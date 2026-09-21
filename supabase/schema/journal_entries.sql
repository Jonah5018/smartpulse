-- Journal storage. Apply to the SmartPulse database, not another project.
-- This change adds one table and its policies; existing tables are unchanged.
begin;
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null check (symbol ~ '^[A-Z0-9/._-]{2,20}$'),
  direction text not null check (direction in ('buy', 'sell')),
  status text not null default 'planned' check (status in ('planned', 'open', 'closed')),
  timeframe text not null check (timeframe in ('1min','5min','15min','30min','1h','4h','1day')),
  trade_date date not null,
  entry_price numeric check (entry_price > 0 and entry_price <= 1e12),
  stop_loss numeric check (stop_loss > 0 and stop_loss <= 1e12),
  take_profit numeric check (take_profit > 0 and take_profit <= 1e12),
  exit_price numeric check (exit_price > 0 and exit_price <= 1e12),
  notes text not null default '' check (length(notes) <= 5000),
  lesson text not null default '' check (length(lesson) <= 3000),
  snapshot jsonb check (snapshot is null or (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) < 65536)),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint executed_prices_required check (status = 'planned' or (entry_price is not null and stop_loss is not null)),
  constraint exit_matches_status check ((status = 'closed' and exit_price is not null) or (status <> 'closed' and exit_price is null)),
  constraint initial_stop_direction check (entry_price is null or stop_loss is null or (direction = 'buy' and stop_loss < entry_price) or (direction = 'sell' and stop_loss > entry_price)),
  constraint target_direction check (entry_price is null or take_profit is null or (direction = 'buy' and take_profit > entry_price) or (direction = 'sell' and take_profit < entry_price))
);
create index journal_entries_owner_date_idx on public.journal_entries (user_id, archived, trade_date desc, created_at desc);
alter table public.journal_entries enable row level security;
revoke all on public.journal_entries from anon, authenticated;
grant select, insert on public.journal_entries to authenticated;
grant update (symbol, direction, status, timeframe, trade_date, entry_price, stop_loss, take_profit, exit_price, notes, lesson, archived, updated_at) on public.journal_entries to authenticated;
create policy "Journal owners read" on public.journal_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "Journal owners insert" on public.journal_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Journal owners update" on public.journal_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- No DELETE grant or policy. The UI archives entries and can restore them.
-- Snapshot, ownership and creation timestamp cannot be overwritten by clients.
commit;
