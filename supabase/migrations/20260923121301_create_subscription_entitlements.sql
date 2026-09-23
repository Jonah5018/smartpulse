-- ============================================================
-- SmartPulse
-- Subscription and trial entitlement foundation
-- ============================================================

-- ------------------------------------------------------------
-- Plan types
-- ------------------------------------------------------------

do $$
begin
  create type public.subscription_plan as enum (
    'basic',
    'pro',
    'elite'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.entitlement_status as enum (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'expired',
    'suspended'
  );
exception
  when duplicate_object then null;
end
$$;

-- ------------------------------------------------------------
-- Entitlements
--
-- One canonical entitlement record per SmartPulse user.
-- ------------------------------------------------------------

create table public.subscription_entitlements (
  id uuid
    primary key
    default gen_random_uuid(),

  user_id uuid
    not null
    unique
    references auth.users(id)
    on delete cascade,

  plan public.subscription_plan
    not null
    default 'pro',

  status public.entitlement_status
    not null
    default 'trialing',

  -- Trial state
  trial_plan public.subscription_plan,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,

  -- Paid subscription state
  subscription_started_at timestamptz,
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,

  -- Billing provider references.
  -- These are identifiers only.
  -- Never store card numbers or sensitive payment data here.
  billing_provider text,
  billing_customer_id text,
  billing_subscription_id text,

  cancel_at_period_end boolean
    not null
    default false,

  canceled_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint entitlement_trial_dates_valid
    check (
      (
        trial_started_at is null
        and trial_ends_at is null
      )
      or
      (
        trial_started_at is not null
        and trial_ends_at is not null
        and trial_ends_at > trial_started_at
      )
    ),

  constraint entitlement_subscription_period_valid
    check (
      current_period_starts_at is null
      or current_period_ends_at is null
      or current_period_ends_at >
        current_period_starts_at
    ),

  constraint entitlement_billing_provider_length
    check (
      billing_provider is null
      or char_length(
        billing_provider
      ) <= 64
    ),

  constraint entitlement_billing_customer_length
    check (
      billing_customer_id is null
      or char_length(
        billing_customer_id
      ) <= 255
    ),

  constraint entitlement_billing_subscription_length
    check (
      billing_subscription_id is null
      or char_length(
        billing_subscription_id
      ) <= 255
    )
);

create index
  subscription_entitlements_status_idx
on public.subscription_entitlements (
  status
);

create index
  subscription_entitlements_trial_ends_idx
on public.subscription_entitlements (
  trial_ends_at
)
where trial_ends_at is not null;

create index
  subscription_entitlements_period_ends_idx
on public.subscription_entitlements (
  current_period_ends_at
)
where current_period_ends_at
  is not null;

-- ------------------------------------------------------------
-- Updated-at trigger
-- ------------------------------------------------------------

create or replace function private.set_subscription_entitlement_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();

  return new;
end;
$$;

create trigger
  subscription_entitlements_set_updated_at
before update
on public.subscription_entitlements
for each row
execute function
  private.set_subscription_entitlement_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table
  public.subscription_entitlements
enable row level security;

-- A user may see their own entitlement.
create policy
  "Users can view own entitlement"
on public.subscription_entitlements
for select
to authenticated
using (
  auth.uid() = user_id
);

-- Users must NOT create or mutate their own plan.
--
-- No INSERT, UPDATE or DELETE policy is intentionally
-- provided for authenticated users.
--
-- Trial creation and billing changes will happen only
-- through trusted server-side/database operations.

revoke all
on table public.subscription_entitlements
from anon;

revoke all
on table public.subscription_entitlements
from authenticated;

grant select
on table public.subscription_entitlements
to authenticated;

-- ------------------------------------------------------------
-- Future table defaults
-- ------------------------------------------------------------

revoke all
on public.subscription_entitlements
from anon;

-- ------------------------------------------------------------
-- Protect helper function
-- ------------------------------------------------------------

revoke execute
on function private.set_subscription_entitlement_updated_at()
from public, anon, authenticated;