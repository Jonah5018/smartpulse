-- ============================================================
-- SmartPulse
-- Bootstrap disposable email domains
-- ============================================================

insert into private.disposable_email_domains (
  domain,
  source
)
values
  ('mailinator.com', 'bootstrap'),
  ('guerrillamail.com', 'bootstrap'),
  ('10minutemail.com', 'bootstrap'),
  ('tempmail.com', 'bootstrap'),
  ('yopmail.com', 'bootstrap')
on conflict (domain) do nothing;