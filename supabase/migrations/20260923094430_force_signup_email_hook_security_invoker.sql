-- ============================================================
-- SmartPulse
-- Force disposable-email Auth Hook to SECURITY INVOKER
-- ============================================================

alter function public.hook_block_disposable_email(jsonb)
security invoker;

grant execute
on function public.hook_block_disposable_email(jsonb)
to supabase_auth_admin;

revoke execute
on function public.hook_block_disposable_email(jsonb)
from public, anon, authenticated;