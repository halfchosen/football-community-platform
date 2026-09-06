-- Scheduled maintenance. Configure endpoint after deploying the authenticated worker.
create extension if not exists pg_cron;
create extension if not exists pg_net;
create table community_private.worker_config (
  name text primary key,
  endpoint text check(endpoint ~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/community-retention$'),
  token text not null default gen_random_uuid()::text||gen_random_uuid()::text
);
alter table community_private.worker_config enable row level security;
revoke all on community_private.worker_config from public,anon,authenticated;
insert into community_private.worker_config(name) values('retention');
create function community_private.check_worker_token(p_token text) returns boolean language sql stable security definer set search_path='' as $$
 select p_token is not null and length(p_token)=72 and exists(select 1 from community_private.worker_config where name='retention' and token=p_token)
$$;
create function public.community_check_worker_token(p_token text) returns boolean language sql security invoker set search_path='' as $$ select community_private.check_worker_token(p_token) $$;
revoke all on function community_private.check_worker_token(text),public.community_check_worker_token(text) from public,anon,authenticated;
grant execute on function community_private.check_worker_token(text),public.community_check_worker_token(text) to service_role;
create function community_private.dispatch_retention() returns bigint language plpgsql security definer set search_path='' as $$
declare config community_private.worker_config; request_id bigint;
begin
 select * into config from community_private.worker_config where name='retention';
 if config.endpoint is null then return null; end if;
 select net.http_post(url:=config.endpoint,headers:=jsonb_build_object('Content-Type','application/json','x-community-job-token',config.token),body:='{}'::jsonb,timeout_milliseconds:=10000) into request_id;
 return request_id;
end $$;
revoke all on function community_private.dispatch_retention() from public,anon,authenticated;
select cron.schedule('community-retention','*/10 * * * *','select community_private.dispatch_retention();');
select cron.schedule('community-writer-status','15 * * * *','select community_private.refresh_writer_statuses();');
