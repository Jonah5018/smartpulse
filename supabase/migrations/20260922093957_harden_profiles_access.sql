-- ============================================================
-- SmartPulse
-- Harden profile access and ownership integrity
-- ============================================================

-- Anonymous visitors must not have direct table privileges
-- on trader profiles.
revoke all privileges
on table public.profiles
from anon;

-- Rebuild authenticated privileges using least privilege.
revoke all privileges
on table public.profiles
from authenticated;

-- SmartPulse currently needs authenticated users to:
-- 1. read their own profile,
-- 2. create their own profile,
-- 3. update their own profile.
--
-- Account deletion will later use a dedicated secure workflow.
grant select, insert, update
on table public.profiles
to authenticated;

-- ============================================================
-- Ownership integrity
-- ============================================================

-- A SmartPulse profile is one-to-one with its Supabase Auth user.
-- Existing data was verified before this migration:
-- total profiles: 2
-- matching profiles: 2
-- mismatched profiles: 0
alter table public.profiles
drop constraint if exists profiles_identity_consistency;

alter table public.profiles
add constraint profiles_identity_consistency
check (id = auth_user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles
enable row level security;

drop policy if exists
  "Users can view their own profile"
on public.profiles;

drop policy if exists
  "Users can insert their own profile"
on public.profiles;

drop policy if exists
  "Users can update their own profile"
on public.profiles;

drop policy if exists
  "Users can delete their own profile"
on public.profiles;

create policy
  "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = auth_user_id
);

create policy
  "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = auth_user_id
  and id = auth_user_id
);

create policy
  "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = auth_user_id
)
with check (
  (select auth.uid()) = auth_user_id
  and id = auth_user_id
);

-- Intentionally no DELETE policy.
-- Full account deletion must use SmartPulse's future
-- controlled account-deletion workflow.

-- ============================================================
-- Safer defaults for future public tables
-- ============================================================

-- New public tables should not automatically receive Data API
-- privileges for anonymous or authenticated users.
-- Required privileges must be granted deliberately.
alter default privileges
for role postgres
in schema public
revoke select, insert, update, delete, truncate, references, trigger
on tables
from anon, authenticated;
