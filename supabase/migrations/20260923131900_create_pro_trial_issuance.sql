-- ============================================================
-- SmartPulse
-- Atomic 30-day Pro Trial Issuance
-- ============================================================

-- ------------------------------------------------------------
-- Trial audit log
-- ------------------------------------------------------------

create table private.trial_issuance_log (
  id bigint
    generated always as identity
    primary key,

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  entitlement_id uuid
    not null
    references public.subscription_entitlements(id)
    on delete cascade,

  trial_plan public.subscription_plan
    not null,

  trial_started_at timestamptz
    not null,

  trial_ends_at timestamptz
    not null,

  created_at timestamptz
    not null
    default now(),

  constraint trial_issuance_log_one_per_user
    unique (user_id),

  constraint trial_issuance_log_dates_valid
    check (
      trial_ends_at >
      trial_started_at
    )
);

revoke all
on table private.trial_issuance_log
from public, anon, authenticated;

-- ------------------------------------------------------------
-- Trial issuance function
--
-- Important:
-- 1. Uses auth.uid(), never a client-supplied user id.
-- 2. Requires a verified email.
-- 3. Allows only one trial ever per auth user.
-- 4. Issues exactly 30 days of Pro access.
-- ------------------------------------------------------------

create or replace function public.start_pro_trial()
returns public.subscription_entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;

  verified_at timestamptz;

  existing_entitlement
    public.subscription_entitlements%rowtype;

  issued_entitlement
    public.subscription_entitlements%rowtype;

  trial_start timestamptz;
  trial_end timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication required';
  end if;

  -- ----------------------------------------------------------
  -- Require verified email
  -- ----------------------------------------------------------

  select
    u.email_confirmed_at
  into
    verified_at
  from auth.users u
  where u.id =
    current_user_id;

  if verified_at is null then
    raise exception
      'Email verification is required before starting a trial';
  end if;

  -- ----------------------------------------------------------
  -- Prevent repeat trial issuance
  -- ----------------------------------------------------------

  if exists (
    select 1
    from private.trial_issuance_log l
    where l.user_id =
      current_user_id
  ) then
    raise exception
      'This account has already received a SmartPulse trial';
  end if;

  -- ----------------------------------------------------------
  -- Lock existing entitlement if present
  -- ----------------------------------------------------------

  select *
  into existing_entitlement
  from public.subscription_entitlements
  where user_id =
    current_user_id
  for update;

  if found then
    if
      existing_entitlement.trial_started_at
        is not null
      or
      existing_entitlement.trial_ends_at
        is not null
    then
      raise exception
        'This account has already received a SmartPulse trial';
    end if;

    if
      existing_entitlement.status =
        'active'
      and
      existing_entitlement.subscription_started_at
        is not null
    then
      raise exception
        'An active paid subscription already exists';
    end if;
  end if;

  trial_start := now();

  trial_end :=
    trial_start
    + interval '30 days';

  -- ----------------------------------------------------------
  -- Create or update entitlement
  -- ----------------------------------------------------------

  insert into public.subscription_entitlements (
    user_id,
    plan,
    status,
    trial_plan,
    trial_started_at,
    trial_ends_at
  )
  values (
    current_user_id,
    'pro',
    'trialing',
    'pro',
    trial_start,
    trial_end
  )
  on conflict (user_id)
  do update
  set
    plan = 'pro',
    status = 'trialing',
    trial_plan = 'pro',
    trial_started_at =
      excluded.trial_started_at,
    trial_ends_at =
      excluded.trial_ends_at,
    updated_at = now()
  returning *
  into issued_entitlement;

  -- ----------------------------------------------------------
  -- Immutable trial issuance record
  -- ----------------------------------------------------------

  insert into private.trial_issuance_log (
    user_id,
    entitlement_id,
    trial_plan,
    trial_started_at,
    trial_ends_at
  )
  values (
    current_user_id,
    issued_entitlement.id,
    'pro',
    trial_start,
    trial_end
  );

  return issued_entitlement;
end;
$$;

-- ------------------------------------------------------------
-- Permissions
--
-- Authenticated users may call the function, but they cannot
-- choose the user, plan, dates, or status.
-- Those values are controlled entirely inside the function.
-- ------------------------------------------------------------

revoke execute
on function public.start_pro_trial()
from public, anon;

grant execute
on function public.start_pro_trial()
to authenticated;