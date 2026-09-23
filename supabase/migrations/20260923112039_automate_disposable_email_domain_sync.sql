-- ============================================================
-- SmartPulse
-- Automated disposable email domain synchronization
--
-- Source:
-- https://disposable.github.io/disposable-email-domains/domains.txt
--
-- The upstream list is refreshed daily.
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------

create extension if not exists http
with schema extensions;

create extension if not exists pg_cron
with schema pg_catalog;

-- ------------------------------------------------------------
-- Sync metadata
-- ------------------------------------------------------------

create table if not exists private.disposable_email_sync_runs (
  id bigint generated always as identity primary key,

  started_at timestamptz
    not null
    default now(),

  completed_at timestamptz,

  status text
    not null
    check (
      status in (
        'running',
        'success',
        'failed'
      )
    ),

  domain_count integer,

  error_message text
);

revoke all
on table private.disposable_email_sync_runs
from public, anon, authenticated;

-- ------------------------------------------------------------
-- Synchronization function
-- ------------------------------------------------------------

create or replace function private.sync_disposable_email_domains()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  response extensions.http_response;
  response_body text;

  domain_lines text[];

  normalized_domain text;

  imported_count integer := 0;

  sync_run_id bigint;
begin
  insert into private.disposable_email_sync_runs (
    status
  )
  values (
    'running'
  )
  returning id
  into sync_run_id;

  /*
   * Fetch the normal disposable-email list.
   *
   * We intentionally do not use domains_strict.txt
   * because its greylist is more aggressive and can
   * increase false positives for legitimate users.
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

  if response_body is null
     or length(response_body) < 1000 then
    raise exception
      'Disposable email source returned an unexpectedly small response';
  end if;

  domain_lines :=
    regexp_split_to_array(
      response_body,
      E'\\r?\\n'
    );

  /*
   * Use a temporary staging table so the active list
   * is not destroyed if the upstream download is bad.
   */
  create temporary table
    temp_disposable_email_domains (
      domain text primary key
    )
  on commit drop;

  foreach normalized_domain
  in array domain_lines
  loop
    normalized_domain :=
      lower(
        trim(
          trailing '.'
          from trim(
            normalized_domain
          )
        )
      );

    if normalized_domain = '' then
      continue;
    end if;

    /*
     * Conservative domain syntax validation.
     * This rejects obviously malformed source rows.
     */
    if normalized_domain !~
      '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'
    then
      continue;
    end if;

    if position(
      '.' in normalized_domain
    ) = 0 then
      continue;
    end if;

    insert into temp_disposable_email_domains (
      domain
    )
    values (
      normalized_domain
    )
    on conflict do nothing;
  end loop;

  select count(*)
  into imported_count
  from temp_disposable_email_domains;

  /*
   * Safety threshold.
   *
   * If the upstream source suddenly becomes empty,
   * truncated, malformed, or compromised in a way
   * that produces a tiny list, keep our existing
   * production blocklist instead of replacing it.
   */
  if imported_count < 1000 then
    raise exception
      'Disposable email source produced only % valid domains',
      imported_count;
  end if;

  /*
   * Remove only records maintained by this automated
   * source. Bootstrap/manual records remain untouched.
   */
  delete from private.disposable_email_domains
  where source =
    'disposable/disposable-email-domains';

  insert into private.disposable_email_domains (
    domain,
    source
  )
  select
    domain,
    'disposable/disposable-email-domains'
  from temp_disposable_email_domains
  on conflict (domain)
  do update
  set
    source = excluded.source,
    updated_at = now();

  update private.disposable_email_sync_runs
  set
    status = 'success',
    completed_at = now(),
    domain_count = imported_count
  where id = sync_run_id;

  return imported_count;

exception
  when others then
    if sync_run_id is not null then
      update private.disposable_email_sync_runs
      set
        status = 'failed',
        completed_at = now(),
        error_message = left(
          sqlerrm,
          1000
        )
      where id = sync_run_id;
    end if;

    raise;
end;
$$;

-- ------------------------------------------------------------
-- Permissions
-- ------------------------------------------------------------

revoke execute
on function private.sync_disposable_email_domains()
from public, anon, authenticated;

-- ------------------------------------------------------------
-- Daily synchronization schedule
--
-- 03:15 UTC every day.
-- ------------------------------------------------------------

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname =
    'smartpulse-disposable-email-domain-sync';

  if existing_job_id is not null then
    perform cron.unschedule(
      existing_job_id
    );
  end if;

  perform cron.schedule(
    'smartpulse-disposable-email-domain-sync',
    '15 3 * * *',
    $cron$
      select private.sync_disposable_email_domains();
    $cron$
  );
end;
$$;