/*
 * SmartPulse database lint cleanup.
 *
 * This migration:
 *
 * 1. Removes an unused variable from start_pro_trial().
 * 2. Removes temporary-table dependencies from the
 *    disposable-email synchronization function.
 * 3. Keeps valid_trade_accounting() genuinely IMMUTABLE by
 *    replacing a storage-size inspection with a deterministic
 *    serialized JSON size check.
 */


/*
 * ============================================================
 * PRO TRIAL ISSUANCE
 * ============================================================
 */

create or replace function public.start_pro_trial()
returns public.subscription_entitlements
language plpgsql
security definer
set search_path = ''
as $function$
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

  /*
   * Serialize trial issuance for this user.
   *
   * This protects against duplicate and concurrent
   * trial-start requests.
   */
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(
      current_user_id::text
    )::bigint
  );

  /*
   * Require verified email.
   */
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

  /*
   * Idempotent retry path.
   *
   * We only need to know whether an issuance record exists.
   * No row variable is required.
   */
  perform 1
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

  /*
   * Lock an existing entitlement if one exists.
   */
  select *
  into existing_entitlement
  from public.subscription_entitlements
  where user_id =
    current_user_id
  for update;

  if found then
    /*
     * Defensive recovery for an entitlement that contains
     * complete trial state but is missing its audit row.
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

  /*
   * Issue exactly 30 days of Pro access.
   */
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
    plan =
      'pro',

    status =
      'trialing',

    trial_plan =
      'pro',

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
$function$;


/*
 * Preserve the intended execution boundary explicitly.
 */

revoke all
on function public.start_pro_trial()
from public;

revoke execute
on function public.start_pro_trial()
from anon;

grant execute
on function public.start_pro_trial()
to authenticated;


/*
 * ============================================================
 * DISPOSABLE EMAIL DOMAIN SYNCHRONIZATION
 * ============================================================
 */

create or replace function private.sync_disposable_email_domains()
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  response extensions.http_response;

  response_body text;

  domain_lines text[];

  imported_count integer :=
    0;

  sync_run_id bigint;
begin
  /*
   * Prevent manual and scheduled synchronization from running
   * concurrently.
   */
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(
      'smartpulse:disposable-email-domain-sync'
    )::bigint
  );

  insert into private.disposable_email_sync_runs (
    status
  )
  values (
    'running'
  )
  returning id
  into sync_run_id;

  /*
   * Fetch the normal disposable-email domain list.
   *
   * The strict source is intentionally not used because
   * aggressive greylisting can increase false positives.
   */
  select *
  into response
  from extensions.http_get(
    'https://disposable.github.io/disposable-email-domains/domains.txt'
  );

  if response.status <> 200 then
    raise exception
      'Disposable email source returned HTTP status %',
      response.status;
  end if;

  response_body :=
    response.content;

  if
    response_body is null
    or length(
      response_body
    ) < 1000
  then
    raise exception
      'Disposable email source returned an unexpectedly small response';
  end if;

  domain_lines :=
    regexp_split_to_array(
      response_body,
      E'\\r?\\n'
    );

  /*
   * Count unique, normalized and syntactically valid domains.
   *
   * This replaces the previous temporary staging table.
   */
  with normalized as (
    select
      lower(
        trim(
          trailing '.'
          from trim(
            source.raw_domain
          )
        )
      ) as domain
    from unnest(
      domain_lines
    ) as source(
      raw_domain
    )
  ),
  valid_domains as (
    select distinct
      domain
    from normalized
    where
      domain <> ''
      and domain ~
        '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'
      and position(
        '.' in domain
      ) > 0
  )
  select
    count(*)::integer
  into
    imported_count
  from valid_domains;

  /*
   * Never replace the production list with an unexpectedly
   * small upstream result.
   */
  if imported_count < 1000 then
    raise exception
      'Disposable email source produced only % valid domains',
      imported_count;
  end if;

  /*
   * Remove only rows maintained by the automated source.
   *
   * Bootstrap and manually managed records remain intact.
   */
  delete from private.disposable_email_domains
  where source =
    'disposable/disposable-email-domains';

  /*
   * Insert the validated source as one atomic replacement.
   */
  with normalized as (
    select
      lower(
        trim(
          trailing '.'
          from trim(
            source.raw_domain
          )
        )
      ) as domain
    from unnest(
      domain_lines
    ) as source(
      raw_domain
    )
  ),
  valid_domains as (
    select distinct
      domain
    from normalized
    where
      domain <> ''
      and domain ~
        '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'
      and position(
        '.' in domain
      ) > 0
  )
  insert into private.disposable_email_domains (
    domain,
    source
  )
  select
    domain,
    'disposable/disposable-email-domains'
  from valid_domains

  on conflict (domain)
  do update
  set
    source =
      excluded.source,

    updated_at =
      pg_catalog.now();

  update private.disposable_email_sync_runs
  set
    status =
      'success',

    completed_at =
      pg_catalog.now(),

    domain_count =
      imported_count

  where id =
    sync_run_id;

  return imported_count;

exception
  when others then
    if sync_run_id is not null then
      update private.disposable_email_sync_runs
      set
        status =
          'failed',

        completed_at =
          pg_catalog.now(),

        error_message =
          left(
            sqlerrm,
            1000
          )

      where id =
        sync_run_id;
    end if;

    raise;
end;
$function$;


/*
 * ============================================================
 * JOURNAL ACCOUNTING VALIDATION
 * ============================================================
 */

create or replace function public.valid_trade_accounting(
  a jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $function$
declare
  e jsonb;

  total numeric :=
    0;
begin
  if a is null then
    return true;
  end if;

  /*
   * Validate the serialized JSON payload rather than its
   * internal PostgreSQL storage representation.
   *
   * pg_column_size() can depend on storage representation and
   * therefore should not be used inside an IMMUTABLE routine.
   */
  if
    jsonb_typeof(
      a
    ) <> 'object'

    or octet_length(
      a::text
    ) > 8192

    or coalesce(
      a->>'currency',
      ''
    ) !~ '^[A-Z]{3}$'

    or not (
      a ?& array[
        'quantity',
        'unitValue',
        'fees',
        'exits'
      ]
    )

    or jsonb_typeof(
      a->'quantity'
    ) <> 'number'

    or jsonb_typeof(
      a->'unitValue'
    ) <> 'number'

    or jsonb_typeof(
      a->'fees'
    ) <> 'number'

    or jsonb_typeof(
      a->'exits'
    ) <> 'array'
  then
    return false;
  end if;

  if
    (
      a->>'quantity'
    )::numeric
      not between
        0.000000000001
        and 1e12

    or (
      a->>'unitValue'
    )::numeric
      not between
        0.000000000001
        and 1e12

    or (
      a->>'fees'
    )::numeric
      not between
        0
        and 1e12

    or jsonb_array_length(
      a->'exits'
    ) > 30
  then
    return false;
  end if;

  for e in
    select value
    from jsonb_array_elements(
      a->'exits'
    )
  loop
    if
      not (
        e ?& array[
          'quantity',
          'price'
        ]
      )

      or jsonb_typeof(
        e->'quantity'
      ) <> 'number'

      or jsonb_typeof(
        e->'price'
      ) <> 'number'

      or (
        e->>'quantity'
      )::numeric
        not between
          0.000000000001
          and 1e12

      or (
        e->>'price'
      )::numeric
        not between
          0.000000000001
          and 1e12
    then
      return false;
    end if;

    total :=
      total
      + (
        e->>'quantity'
      )::numeric;
  end loop;

  return
    total <=
      (
        a->>'quantity'
      )::numeric
      * 1.000000001;

exception
  when others then
    return false;
end;
$function$;