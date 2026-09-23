-- ============================================================
-- SmartPulse
-- Disposable email signup protection
-- ============================================================

-- Keep abuse-control data outside the exposed Data API schema.
create schema if not exists private;

-- ============================================================
-- Disposable email domain registry
-- ============================================================

create table if not exists private.disposable_email_domains (
  domain text primary key,
  source text,
  created_at timestamptz
    not null
    default now(),
  updated_at timestamptz
    not null
    default now()
);

-- Normalize domains before storage.
create or replace function private.normalize_disposable_email_domain()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.domain :=
    lower(
      trim(
        trailing '.'
        from trim(new.domain)
      )
    );

  new.updated_at := now();

  return new;
end;
$$;

drop trigger if exists
  normalize_disposable_email_domain
on private.disposable_email_domains;

create trigger
  normalize_disposable_email_domain
before insert or update
on private.disposable_email_domains
for each row
execute function
  private.normalize_disposable_email_domain();

-- ============================================================
-- Authorization
-- ============================================================

revoke all
on schema private
from public, anon, authenticated;

revoke all
on table private.disposable_email_domains
from public, anon, authenticated;

grant usage
on schema private
to supabase_auth_admin;

grant select
on table private.disposable_email_domains
to supabase_auth_admin;

-- ============================================================
-- Before User Created Auth Hook
-- ============================================================

create or replace function public.hook_block_disposable_email(
  event jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  signup_email text;
  email_domain text;
  is_disposable boolean;
begin
  signup_email :=
    lower(
      trim(
        event->'user'->>'email'
      )
    );

  if signup_email is null
     or signup_email = ''
     or position('@' in signup_email) = 0 then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'message',
        'A valid email address is required.',
        'http_code',
        400
      )
    );
  end if;

  email_domain :=
    lower(
      trim(
        trailing '.'
        from split_part(
          signup_email,
          '@',
          2
        )
      )
    );

  select exists (
    select 1
    from private.disposable_email_domains d
    where d.domain = email_domain
  )
  into is_disposable;

  if is_disposable then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'message',
        'Temporary or disposable email addresses are not allowed. Please use a permanent email address.',
        'http_code',
        403
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant execute
on function public.hook_block_disposable_email(jsonb)
to supabase_auth_admin;

revoke execute
on function public.hook_block_disposable_email(jsonb)
from public, anon, authenticated;