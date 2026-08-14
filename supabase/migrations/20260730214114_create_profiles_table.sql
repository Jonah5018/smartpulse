-- ============================================================
-- SmartPulse
-- Migration: Create Profiles Table
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Enums
-- ============================================================

create type public.experience_level as enum (
    'beginner',
    'intermediate',
    'advanced',
    'professional'
);

create type public.learning_mode as enum (
    'learning',
    'intermediate',
    'advanced',
    'professional'
);

-- ============================================================
-- Profiles
-- ============================================================

create table public.profiles (

    id uuid primary key
    references auth.users(id)
    on delete cascade,

    -- Kept explicitly for authorization policies and lookup indexes.
    -- It must match `id` for each one-to-one profile row.
    auth_user_id uuid not null unique
    references auth.users(id)
    on delete cascade,

    first_name text not null,

    other_names text,

    last_name text not null,

    full_name text not null,

    email text not null,

    timezone text,

    experience_level public.experience_level not null,

    learning_mode public.learning_mode
        not null
        default 'learning',

    trading_styles text[]
        not null
        default '{}',

    preferred_timeframes text[]
        not null
        default '{}',

    market_categories text[]
        not null
        default '{}',

    favorite_markets text[]
        not null
        default '{}',

    goals text[]
        not null
        default '{}',

    challenges text[]
        not null
        default '{}',

    onboarding_completed boolean
        not null
        default false,

    created_at timestamptz
        not null
        default timezone('utc', now()),

    updated_at timestamptz
        not null
        default timezone('utc', now())
);

-- ============================================================
-- Indexes
-- ============================================================

create index profiles_auth_user_idx
on public.profiles(auth_user_id);

create index profiles_email_idx
on public.profiles(email);

create index profiles_experience_idx
on public.profiles(experience_level);

-- ============================================================
-- Updated At Trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create trigger profiles_set_updated_at
before update
on public.profiles
for each row
execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles
enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
using (
    auth.uid() = id
);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (
    auth.uid() = auth_user_id
);

create policy "Users can update their own profile"
on public.profiles
for update
using (
    auth.uid() = auth_user_id
);

create policy "Users can delete their own profile"
on public.profiles
for delete
using (
    auth.uid() = auth_user_id
);

-- ============================================================
-- Documentation
-- ============================================================

comment on table public.profiles is
'Stores the permanent SmartPulse trader profile for each authenticated user.';

comment on column public.profiles.id is
'Primary key. Also references auth.users.id, establishing a one-to-one relationship between an authenticated user and their trader profile.';

comment on column public.profiles.learning_mode is
'Controls how educational and AI guidance is presented throughout SmartPulse.';

comment on column public.profiles.onboarding_completed is
'Determines whether the user should be redirected to onboarding or the dashboard.';
