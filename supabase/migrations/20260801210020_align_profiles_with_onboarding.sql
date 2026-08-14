-- The deployed profiles table predates onboarding. Add the fields submitted by
-- the app without disturbing accounts that already have a base profile.

do $$
begin
  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'experience_level'
  ) then
    create type public.experience_level as enum (
      'beginner', 'intermediate', 'advanced', 'professional'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'learning_mode'
  ) then
    create type public.learning_mode as enum (
      'learning', 'intermediate', 'advanced', 'professional'
    );
  end if;
end;
$$;

alter table public.profiles
  add column if not exists experience_level public.experience_level,
  add column if not exists learning_mode public.learning_mode not null default 'learning',
  add column if not exists trading_styles text[] not null default '{}',
  add column if not exists preferred_timeframes text[] not null default '{}',
  add column if not exists market_categories text[] not null default '{}',
  add column if not exists favorite_markets text[] not null default '{}',
  add column if not exists goals text[] not null default '{}',
  add column if not exists challenges text[] not null default '{}',
  add column if not exists onboarding_completed boolean not null default false;

-- The legacy policies expose every profile to every authenticated caller.
-- Replace them with ownership checks that also support upsert retries.
drop policy if exists "Allow profile inserts" on public.profiles;
drop policy if exists "Allow profile reads" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = auth_user_id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

create policy "Users can delete their own profile"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = auth_user_id);
