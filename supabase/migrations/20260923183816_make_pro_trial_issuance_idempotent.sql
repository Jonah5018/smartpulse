-- ============================================================
-- SmartPulse
-- Make Pro Trial Issuance Idempotent
-- ============================================================

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

  existing_log
    private.trial_issuance_log%rowtype;

  trial_start timestamptz;
  trial_end timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication required';
  end if;

  /*
   * Serialize trial issuance for this user.
   * This protects against double-clicks and
   * concurrent requests.
   */
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(
      current_user_id::text
    )::bigint
  );

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
  -- Idempotent retry path
  --
  -- If this user already received a trial, return the
  -- existing entitlement instead of creating another one.
  -- ----------------------------------------------------------

  select *
  into existing_log
  from private.trial_issuance_log
  where user_id =
    current_user_id;

  if found then
    select *
    into issued_entitlement
    from public.subscription_entitlements
    where user_id =
      current_user_id;

    if not found then
      raise exception
        'Trial entitlement state is inconsistent';
    end if;

    return issued_entitlement;
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
    /*
     * Defensive recovery for an entitlement that already
     * contains valid trial dates but lacks its audit row.
     */
    if
      existing_entitlement.trial_started_at
        is not null
      and
      existing_entitlement.trial_ends_at
        is not null
      and
      existing_entitlement.trial_plan
        is not null
    then
      insert into private.trial_issuance_log (
        user_id,
        entitlement_id,
        trial_plan,
        trial_started_at,
        trial_ends_at
      )
      values (
        current_user_id,
        existing_entitlement.id,
        existing_entitlement.trial_plan,
        existing_entitlement.trial_started_at,
        existing_entitlement.trial_ends_at
      )
      on conflict (user_id)
      do nothing;

      return existing_entitlement;
    end if;

    if
      existing_entitlement.trial_started_at
        is not null
      or
      existing_entitlement.trial_ends_at
        is not null
    then
      raise exception
        'Trial entitlement state is inconsistent';
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

  -- ----------------------------------------------------------
  -- Issue exactly 30 days of Pro access
  -- ----------------------------------------------------------

  trial_start :=
    pg_catalog.now();

  trial_end :=
    trial_start
    + interval '30 days';

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
    updated_at =
      pg_catalog.now()
  returning *
  into issued_entitlement;

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

revoke execute
on function public.start_pro_trial()
from public, anon;

grant execute
on function public.start_pro_trial()
to authenticated;