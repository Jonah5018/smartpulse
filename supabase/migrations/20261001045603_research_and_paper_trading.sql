begin;

-- Optional accounting preserves legacy price-only journal rows.
create or replace function public.valid_trade_accounting(a jsonb)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
declare e jsonb; total numeric := 0;
begin
  if a is null then return true; end if;
  if jsonb_typeof(a) <> 'object' or pg_column_size(a) > 8192
     or coalesce(a->>'currency','') !~ '^[A-Z]{3}$'
     or not (a ?& array['quantity','unitValue','fees','exits'])
     or jsonb_typeof(a->'quantity') <> 'number' or jsonb_typeof(a->'unitValue') <> 'number'
     or jsonb_typeof(a->'fees') <> 'number' or jsonb_typeof(a->'exits') <> 'array' then return false; end if;
  if (a->>'quantity')::numeric not between 0.000000000001 and 1e12
     or (a->>'unitValue')::numeric not between 0.000000000001 and 1e12
     or (a->>'fees')::numeric not between 0 and 1e12
     or jsonb_array_length(a->'exits') > 30 then return false; end if;
  for e in select value from jsonb_array_elements(a->'exits') loop
    if not (e ?& array['quantity','price']) or jsonb_typeof(e->'quantity') <> 'number'
       or jsonb_typeof(e->'price') <> 'number'
       or (e->>'quantity')::numeric not between 0.000000000001 and 1e12
       or (e->>'price')::numeric not between 0.000000000001 and 1e12 then return false; end if;
    total := total + (e->>'quantity')::numeric;
  end loop;
  return total <= (a->>'quantity')::numeric * 1.000000001;
exception when others then return false;
end $$;
revoke all on function public.valid_trade_accounting(jsonb) from public, anon;
grant execute on function public.valid_trade_accounting(jsonb) to authenticated, service_role;
alter table public.journal_entries add column accounting jsonb;
alter table public.journal_entries add column execution_mode text not null default 'manual' check(execution_mode in ('manual','paper'));
revoke insert on public.journal_entries from authenticated;
grant insert(id,user_id,symbol,direction,status,timeframe,trade_date,entry_price,stop_loss,take_profit,exit_price,notes,lesson,snapshot,archived,created_at,updated_at,accounting) on public.journal_entries to authenticated;
alter table public.journal_entries add constraint journal_valid_accounting check(public.valid_trade_accounting(accounting));
grant update(accounting) on public.journal_entries to authenticated;
grant select,insert,update on public.journal_entries to service_role;

create table public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'paper' check(provider = 'paper'),
  currency text not null default 'USD' check(currency = 'USD'),
  balance numeric not null default 10000 check(balance >= 0),
  peak_balance numeric not null default 10000 check(peak_balance >= balance),
  enabled boolean not null default false,
  stopped boolean not null default false,
  mode text not null default 'analysis' check(mode in ('analysis','paper')),
  risk_percent numeric not null default 0.5 check(risk_percent between 0.1 and 1),
  max_positions integer not null default 2 check(max_positions between 1 and 2),
  allowed_symbols text[] not null default array['EUR/USD','GBP/USD','XAU/USD'],
  lease_until timestamptz,
  last_checked_at timestamptz,
  monitoring_error text check(length(monitoring_error)<=300),
  created_at timestamptz not null default now(),
  unique(user_id, provider),
  unique(id,user_id)
);

create table public.trade_intents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  setup_key text not null check(length(setup_key) between 1 and 150),
  symbol text not null check(length(symbol) between 2 and 20),
  direction text not null check(direction in ('buy','sell')),
  state text not null check(state in ('filled','closed','rejected')),
  entry numeric not null check(entry > 0 and entry < 1e12),
  stop numeric not null check(stop > 0 and stop < 1e12),
  target numeric not null check(target > 0 and target < 1e12),
  quantity numeric not null check(quantity > 0 and quantity < 1e12),
  risk numeric not null check(risk > 0 and risk < 1e12),
  exit_price numeric,
  realized_pnl numeric,
  journal_id uuid not null references public.journal_entries(id),
  reasoning jsonb not null check(jsonb_typeof(reasoning)='object' and pg_column_size(reasoning)<16384),
  opened_at timestamptz not null default now(),
  checked_through timestamptz not null default now(),
  closed_at timestamptz,
  foreign key(account_id,user_id) references public.trading_accounts(id,user_id) on delete cascade,
  unique(account_id,setup_key),
  check((direction='buy' and stop<entry and target>entry) or (direction='sell' and stop>entry and target<entry)),
  check((state='closed' and closed_at is not null and exit_price>0 and realized_pnl is not null) or (state<>'closed' and closed_at is null))
);
create index trade_intents_owner_time on public.trade_intents(user_id,opened_at desc);
create index trade_intents_account_active on public.trade_intents(account_id,state);

create table public.automation_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.trading_accounts(id) on delete cascade,
  kind text not null check(length(kind) between 1 and 60),
  message text not null check(length(message)<=1000),
  created_at timestamptz not null default now()
);
create index automation_events_owner_time on public.automation_events(user_id,created_at desc);

create table public.market_alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null check(length(symbol) between 2 and 20),
  enabled boolean not null default true,
  last_state text,
  last_observed_at timestamptz,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id,symbol)
);
create index market_alert_rules_owner on public.market_alert_rules(user_id);
create table public.market_alert_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id uuid not null references public.market_alert_rules(id) on delete cascade,
  symbol text not null,
  previous_state text not null,
  current_state text not null,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(rule_id,observed_at,current_state)
);
create index market_alert_events_owner on public.market_alert_events(user_id,created_at desc);

alter table public.trading_accounts enable row level security;
alter table public.trade_intents enable row level security;
alter table public.automation_events enable row level security;
alter table public.market_alert_rules enable row level security;
alter table public.market_alert_events enable row level security;
revoke all on public.trading_accounts,public.trade_intents,public.automation_events,public.market_alert_rules,public.market_alert_events from anon,authenticated;
grant select on public.trading_accounts,public.trade_intents,public.automation_events,public.market_alert_rules,public.market_alert_events to authenticated;
grant all on public.trading_accounts,public.trade_intents,public.market_alert_rules,public.market_alert_events to service_role;
grant select,insert on public.automation_events to service_role;
revoke update,delete,truncate on public.automation_events from service_role;
grant usage,select on sequence public.automation_events_id_seq,public.market_alert_events_id_seq to service_role;
create policy own_accounts on public.trading_accounts for select to authenticated using((select auth.uid())=user_id);
create policy own_intents on public.trade_intents for select to authenticated using((select auth.uid())=user_id);
create policy own_automation_events on public.automation_events for select to authenticated using((select auth.uid())=user_id);
create policy own_alert_rules on public.market_alert_rules for select to authenticated using((select auth.uid())=user_id);
create policy own_alert_events on public.market_alert_events for select to authenticated using((select auth.uid())=user_id);

-- Mutations below are service-only. Application actions authenticate and authorize the actor first.
create function public.configure_paper_account(p_user uuid,p_enabled boolean,p_stopped boolean,p_risk numeric,p_symbols text[])
returns uuid language plpgsql security invoker set search_path = '' as $$
declare a public.trading_accounts;
begin
  if p_risk is null or p_risk not between 0.1 and 1 or p_symbols is null or cardinality(p_symbols) not between 1 and 8
     or not p_symbols <@ array['EUR/USD','GBP/USD','AUD/USD','NZD/USD','XAU/USD','XAG/USD','BTC/USD','ETH/USD'] then
    raise exception 'Invalid paper configuration';
  end if;
  insert into public.trading_accounts(user_id) values(p_user) on conflict(user_id,provider) do nothing;
  select * into a from public.trading_accounts where user_id=p_user and provider='paper' for update;
  update public.trading_accounts set enabled=p_enabled and not p_stopped,stopped=p_stopped,
    mode=case when p_enabled and not p_stopped then 'paper' else 'analysis' end,
    risk_percent=p_risk,allowed_symbols=p_symbols where id=a.id;
  insert into public.automation_events(user_id,account_id,kind,message) values(p_user,a.id,
    case when p_stopped then 'kill_switch' when p_enabled then 'paper_enabled' else 'paper_paused' end,
    'Paper settings updated. Risk per trade: '||p_risk||'%. Existing positions remain monitored.');
  return a.id;
end $$;

create function public.execute_paper_trade(p_user uuid,p_key text,p_symbol text,p_direction text,p_entry numeric,p_stop numeric,p_target numeric,p_reasoning jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare a public.trading_accounts; existing_id uuid; new_id uuid:=gen_random_uuid(); journal uuid:=gen_random_uuid();
  distance numeric; reward numeric; size numeric; risk_amount numeric; open_risk numeric; daily_loss numeric; weekly_loss numeric;
  positions integer; daily_count integer; recent_losses integer;
begin
  select * into a from public.trading_accounts where user_id=p_user and provider='paper' for update;
  if not found then raise exception 'Paper account is not configured'; end if;
  select id into existing_id from public.trade_intents where account_id=a.id and setup_key=p_key;
  if found then return existing_id; end if;
  if not a.enabled or a.stopped or a.mode<>'paper' or a.monitoring_error is not null then raise exception 'Paper entries are paused'; end if;
  if p_symbol is null or not p_symbol=any(a.allowed_symbols) then raise exception 'Instrument is not permitted'; end if;
  if p_entry is null or p_stop is null or p_target is null or p_entry not between 0.00000001 and 999999999999
    or p_stop not between 0.00000001 and 999999999999 or p_target not between 0.00000001 and 999999999999
    or p_direction is null or p_direction not in ('buy','sell') then raise exception 'Invalid protected order'; end if;
  distance := (p_entry-p_stop)*case when p_direction='buy' then 1 else -1 end;
  reward := (p_target-p_entry)*case when p_direction='buy' then 1 else -1 end;
  if distance<=0 or reward/distance<2 then raise exception 'A protective stop and at least 2R target are required'; end if;
  if exists(select 1 from public.trade_intents where account_id=a.id and symbol=p_symbol and state='filled') then raise exception 'An open paper position already exists for this instrument'; end if;
  -- Synthetic paper units only: USD 1 per price point per unit. No broker lot assumptions.
  size:=floor((a.balance*a.risk_percent/100/distance)*1000000)/1000000;
  risk_amount:=size*distance;
  if size<=0 or size>1000000 then raise exception 'Paper quantity is outside bounds'; end if;
  select count(*),coalesce(sum(risk),0) into positions,open_risk from public.trade_intents where account_id=a.id and state='filled';
  select count(*) into daily_count from public.trade_intents where account_id=a.id and opened_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
  select coalesce(sum(greatest(-realized_pnl,0)) filter(where closed_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC'),0),
    coalesce(sum(greatest(-realized_pnl,0)),0) into daily_loss,weekly_loss from public.trade_intents
    where account_id=a.id and state='closed' and closed_at>=date_trunc('week',now() at time zone 'UTC') at time zone 'UTC';
  select count(*) into recent_losses from (select realized_pnl from public.trade_intents where account_id=a.id and state='closed' and closed_at>=now()-interval '24 hours' order by closed_at desc limit 3) r where realized_pnl<0;
  if positions>=a.max_positions or daily_count>=5 or recent_losses>=3 or open_risk+risk_amount>a.balance*0.01
    or daily_loss+open_risk+risk_amount>a.balance*0.02 or weekly_loss+open_risk+risk_amount>a.balance*0.05
    or a.peak_balance-a.balance+open_risk+risk_amount>a.peak_balance*0.10 then raise exception 'A paper risk limit or loss cooldown blocks this entry'; end if;
  insert into public.journal_entries(id,user_id,symbol,direction,status,timeframe,trade_date,entry_price,stop_loss,take_profit,notes,lesson,accounting,execution_mode)
    values(journal,p_user,p_symbol,p_direction,'open','15min',(now() at time zone 'UTC')::date,p_entry,p_stop,p_target,
    'PAPER PRACTICE — synthetic units, no broker order. Manually approved rehearsal; not an automatically qualified signal.','',
    jsonb_build_object('currency','USD','quantity',size,'unitValue',1,'fees',0,'exits','[]'::jsonb),'paper');
  insert into public.trade_intents(id,account_id,user_id,setup_key,symbol,direction,state,entry,stop,target,quantity,risk,journal_id,reasoning)
    values(new_id,a.id,p_user,p_key,p_symbol,p_direction,'filled',p_entry,p_stop,p_target,size,risk_amount,journal,p_reasoning);
  insert into public.automation_events(user_id,account_id,kind,message) values(p_user,a.id,'paper_filled','Approved paper rehearsal filled; protected risk '||round(risk_amount,2)||' USD. No broker order.');
  return new_id;
end $$;

create function public.close_paper_trade(p_user uuid,p_intent uuid,p_price numeric,p_reason text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare a public.trading_accounts; t public.trade_intents; pnl numeric;
begin
  select * into a from public.trading_accounts where user_id=p_user and provider='paper' for update;
  select * into t from public.trade_intents where id=p_intent and user_id=p_user and account_id=a.id for update;
  if not found then raise exception 'Paper position not found'; end if;
  if t.state='closed' then return false; end if;
  if p_price is null or p_price not between 0.00000001 and 999999999999 or p_reason not in ('manual','stop','target') then raise exception 'Invalid closing fill'; end if;
  pnl:=(p_price-t.entry)*t.quantity*case when t.direction='buy' then 1 else -1 end;
  update public.trade_intents set state='closed',exit_price=p_price,realized_pnl=pnl,closed_at=now() where id=t.id;
  update public.trading_accounts set balance=greatest(0,balance+pnl),peak_balance=greatest(peak_balance,balance+pnl) where id=a.id;
  update public.journal_entries set status='closed',exit_price=p_price,updated_at=now(),
    lesson='Paper exit: '||p_reason||'. OHLC monitoring uses the stop first if both protections are touched.',
    accounting=jsonb_build_object('currency','USD','quantity',t.quantity,'unitValue',1,'fees',0,'exits',jsonb_build_array(jsonb_build_object('quantity',t.quantity,'price',p_price)))
    where id=t.journal_id and user_id=p_user;
  insert into public.automation_events(user_id,account_id,kind,message) values(p_user,a.id,'paper_closed','Paper position closed: '||p_reason||'; P/L '||round(pnl,2)||' USD.');
  return true;
end $$;

create function public.observe_market_alert(p_rule uuid,p_state text,p_observed timestamptz)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare r public.market_alert_rules;
begin
  select * into r from public.market_alert_rules where id=p_rule and enabled for update;
  if not found or p_state is null or length(p_state)>100 or p_observed is null or p_observed>now()+interval '5 seconds'
     or (r.last_observed_at is not null and p_observed<=r.last_observed_at) then return false; end if;
  if r.last_state is not null and r.last_state<>p_state then
    insert into public.market_alert_events(user_id,rule_id,symbol,previous_state,current_state,observed_at)
      values(r.user_id,r.id,r.symbol,r.last_state,p_state,p_observed) on conflict do nothing;
  end if;
  update public.market_alert_rules set last_state=p_state,last_observed_at=p_observed where id=r.id;
  return r.last_state is not null and r.last_state<>p_state;
end $$;

create function public.claim_paper_monitor()
returns setof public.trading_accounts language plpgsql security invoker set search_path = '' as $$
begin
  return query update public.trading_accounts set lease_until=now()+interval '5 minutes'
  where id in (select a.id from public.trading_accounts a where (a.lease_until is null or a.lease_until<now())
    and exists(select 1 from public.trade_intents t where t.account_id=a.id and t.state='filled')
    order by a.last_checked_at nulls first limit 1 for update skip locked) returning *;
end $$;

revoke all on function public.configure_paper_account(uuid,boolean,boolean,numeric,text[]),
  public.execute_paper_trade(uuid,text,text,text,numeric,numeric,numeric,jsonb),
  public.close_paper_trade(uuid,uuid,numeric,text),
  public.observe_market_alert(uuid,text,timestamptz),
  public.claim_paper_monitor() from public,anon,authenticated;
grant execute on function public.configure_paper_account(uuid,boolean,boolean,numeric,text[]),
  public.execute_paper_trade(uuid,text,text,text,numeric,numeric,numeric,jsonb),
  public.close_paper_trade(uuid,uuid,numeric,text),
  public.observe_market_alert(uuid,text,timestamptz),
  public.claim_paper_monitor() to service_role;

create function public.stop_paper_account(p_user uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare account uuid;
begin
  update public.trading_accounts set enabled=false,stopped=true,mode='analysis' where user_id=p_user returning id into account;
  if account is not null then
    insert into public.automation_events(user_id,account_id,kind,message) values(p_user,account,'kill_switch','Emergency stop: new entries disabled; existing positions remain monitored.');
  end if;
end $$;
revoke all on function public.stop_paper_account(uuid) from public,anon,authenticated;
grant execute on function public.stop_paper_account(uuid) to service_role;

-- Paper ledger fields are authored by the execution service, never by journal edits.
create function public.protect_paper_journal()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user = 'authenticated' and old.execution_mode='paper' and
    (new.symbol,new.direction,new.status,new.timeframe,new.trade_date,new.entry_price,new.stop_loss,new.take_profit,new.exit_price,new.accounting)
    is distinct from
    (old.symbol,old.direction,old.status,old.timeframe,old.trade_date,old.entry_price,old.stop_loss,old.take_profit,old.exit_price,old.accounting)
  then raise exception 'Paper execution fields are managed by the trading service'; end if;
  return new;
end $$;
revoke all on function public.protect_paper_journal() from public,anon,authenticated;
create trigger protect_paper_journal before update on public.journal_entries for each row execute function public.protect_paper_journal();

commit;

