-- Transactional verification: test identities and entries are rolled back.
begin;
insert into auth.users (id) values ('f9a03811-0132-4a2c-a40d-eee559a76901'), ('f9a03811-0132-4a2c-a40d-eee559a76902');
set local role authenticated;
select set_config('request.jwt.claim.sub', 'f9a03811-0132-4a2c-a40d-eee559a76901', true);
insert into public.journal_entries (id,user_id,symbol,direction,status,timeframe,trade_date)
values ('d3b62cc7-d9e1-4fd0-baea-6c34197aabe1','f9a03811-0132-4a2c-a40d-eee559a76901','GBP/USD','buy','planned','15min','2026-09-21');
do $$ begin
  if (select count(*) from public.journal_entries where id='d3b62cc7-d9e1-4fd0-baea-6c34197aabe1') <> 1 then raise exception 'Owner cannot read'; end if;
  update public.journal_entries set notes='owner update', archived=true where id='d3b62cc7-d9e1-4fd0-baea-6c34197aabe1';
  if not found then raise exception 'Owner cannot update'; end if;
  update public.journal_entries set archived=false where id='d3b62cc7-d9e1-4fd0-baea-6c34197aabe1';
  begin
    update public.journal_entries set user_id='f9a03811-0132-4a2c-a40d-eee559a76902' where id='d3b62cc7-d9e1-4fd0-baea-6c34197aabe1';
    raise exception 'Ownership reassignment allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.journal_entries where id='d3b62cc7-d9e1-4fd0-baea-6c34197aabe1';
    raise exception 'Permanent delete allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', 'f9a03811-0132-4a2c-a40d-eee559a76902', true);
do $$ begin
  if exists (select 1 from public.journal_entries where id='d3b62cc7-d9e1-4fd0-baea-6c34197aabe1') then raise exception 'Cross-user read allowed'; end if;
  update public.journal_entries set notes='cross-user edit' where id='d3b62cc7-d9e1-4fd0-baea-6c34197aabe1';
  if found then raise exception 'Cross-user update allowed'; end if;
  begin
    insert into public.journal_entries(user_id,symbol,direction,status,timeframe,trade_date) values('f9a03811-0132-4a2c-a40d-eee559a76901','GBP/USD','buy','planned','15min','2026-09-21');
    raise exception 'Cross-user insert allowed';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin
    perform id from public.journal_entries limit 1;
    raise exception 'Anonymous read allowed';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
