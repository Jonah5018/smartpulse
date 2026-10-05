begin;
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
set local role service_role;
select public.configure_paper_account('11111111-1111-4111-8111-111111111111',true,false,0.5,array['EUR/USD','GBP/USD','XAU/USD']);
select public.execute_paper_trade('11111111-1111-4111-8111-111111111111','rehearsal-1','EUR/USD','buy',100,90,120,'{}');
select public.execute_paper_trade('11111111-1111-4111-8111-111111111111','rehearsal-1','EUR/USD','buy',100,90,120,'{}');
do $$ begin
  if (select count(*) from public.trade_intents)<>1 then raise exception 'Idempotency failed'; end if;
  if (select count(*) from public.journal_entries)<>1 then raise exception 'Journal duplicated'; end if;
  begin
    perform public.execute_paper_trade('11111111-1111-4111-8111-111111111111','rehearsal-2','EUR/USD','buy',100,90,120,'{}');
    raise exception 'Duplicate exposure accepted';
  exception when raise_exception then if sqlerrm='Duplicate exposure accepted' then raise; end if; end;
end $$;
select public.execute_paper_trade('11111111-1111-4111-8111-111111111111','rehearsal-3','GBP/USD','buy',100,90,120,'{}');
do $$ begin
  begin
    perform public.execute_paper_trade('11111111-1111-4111-8111-111111111111','rehearsal-4','XAU/USD','buy',100,90,120,'{}');
    raise exception 'Position limit bypass';
  exception when raise_exception then if sqlerrm='Position limit bypass' then raise; end if; end;
end $$;
select public.close_paper_trade('11111111-1111-4111-8111-111111111111',id,120,'target') from public.trade_intents where symbol='EUR/USD';
select public.close_paper_trade('11111111-1111-4111-8111-111111111111',id,120,'target') from public.trade_intents where symbol='EUR/USD';
do $$ begin
  if (select balance from public.trading_accounts)<>10100 then raise exception 'Closing was not idempotent'; end if;
  if (select count(*) from public.journal_entries where status='closed')<>1 then raise exception 'Journal closing failed'; end if;
  begin update public.automation_events set message='changed'; raise exception 'Audit was mutable';
  exception when insufficient_privilege then null; end;
end $$;
select public.configure_paper_account('11111111-1111-4111-8111-111111111111',false,true,0.5,array['EUR/USD']);
do $$ begin
  begin perform public.execute_paper_trade('11111111-1111-4111-8111-111111111111','stopped','EUR/USD','buy',100,90,120,'{}'); raise exception 'Stop bypass';
  exception when raise_exception then if sqlerrm='Stop bypass' then raise; end if; end;
end $$;
insert into public.market_alert_rules(user_id,symbol) values('11111111-1111-4111-8111-111111111111','EUR/USD');
select public.observe_market_alert(id,'forming',now()-interval '3 minutes') from public.market_alert_rules;
select public.observe_market_alert(id,'ready',now()-interval '2 minutes') from public.market_alert_rules;
select public.observe_market_alert(id,'ready',now()-interval '2 minutes') from public.market_alert_rules;
select public.observe_market_alert(id,'forming',now()-interval '4 minutes') from public.market_alert_rules;
do $$ begin if (select count(*) from public.market_alert_events)<>1 then raise exception 'Alert dedupe failed'; end if; end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
  if exists(select 1 from public.trading_accounts) or exists(select 1 from public.trade_intents) or exists(select 1 from public.market_alert_rules)
    or exists(select 1 from public.market_alert_events) or exists(select 1 from public.automation_events) then raise exception 'Cross-owner disclosure'; end if;
  begin perform public.configure_paper_account('11111111-1111-4111-8111-111111111111',true,false,1,array['EUR/USD']); raise exception 'RPC exposed';
  exception when insufficient_privilege then null; end;
  begin insert into public.automation_events(user_id,kind,message) values('22222222-2222-4222-8222-222222222222','forged','forged'); raise exception 'Audit insertion exposed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  if (select count(*) from public.trading_accounts)<>1 then raise exception 'Owner cannot read account'; end if;
  if public.valid_trade_accounting('{"currency":"USD","quantity":1,"unitValue":1,"fees":0,"exits":[{"quantity":2,"price":100}]}') then raise exception 'Overfill accounting accepted'; end if;
end $$;
rollback;

