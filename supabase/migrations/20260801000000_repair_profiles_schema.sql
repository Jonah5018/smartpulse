-- Repair the existing, untracked profiles table before relying on it for
-- onboarding. The original table uses auth_user_id in policies and indexes,
-- but did not define that column.

alter table public.profiles
add column if not exists auth_user_id uuid;

update public.profiles
set auth_user_id = id
where auth_user_id is null;

alter table public.profiles
alter column auth_user_id set not null;

create unique index if not exists profiles_auth_user_unique_idx
on public.profiles(auth_user_id);

create index if not exists profiles_auth_user_idx
on public.profiles(auth_user_id);

alter table public.profiles
enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view their own profile'
  ) then
    create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can insert their own profile'
  ) then
    create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can delete their own profile'
  ) then
    create policy "Users can delete their own profile"
    on public.profiles for delete
    using (auth.uid() = auth_user_id);
  end if;
end;
$$;
