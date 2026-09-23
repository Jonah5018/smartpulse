-- ============================================================
-- SmartPulse
-- Versioned legal acceptance records
-- ============================================================

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  terms_version text not null
    check (
      char_length(terms_version)
      between 1 and 64
    ),

  privacy_version text not null
    check (
      char_length(privacy_version)
      between 1 and 64
    ),

  risk_disclosure_version text not null
    check (
      char_length(risk_disclosure_version)
      between 1 and 64
    ),

  accepted_at timestamptz
    not null
    default now(),

  constraint legal_acceptances_unique_version
    unique (
      user_id,
      terms_version,
      privacy_version,
      risk_disclosure_version
    )
);

create index legal_acceptances_user_time_idx
on public.legal_acceptances (
  user_id,
  accepted_at desc
);

-- ============================================================
-- Security
-- ============================================================

alter table public.legal_acceptances
enable row level security;

revoke all privileges
on table public.legal_acceptances
from anon, authenticated;

grant select, insert
on table public.legal_acceptances
to authenticated;

create policy
  "Users can view their own legal acceptances"
on public.legal_acceptances
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy
  "Users can record their own legal acceptance"
on public.legal_acceptances
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

-- No UPDATE privilege or policy.
-- An acceptance record is immutable once created.
--
-- No DELETE privilege or policy for users.
-- Account deletion handling will determine the appropriate
-- retention behavior through the controlled deletion workflow.
