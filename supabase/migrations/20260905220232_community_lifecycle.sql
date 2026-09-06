-- Community operating model. Additive migration; existing memberships are preserved.
create schema if not exists community_private;
revoke all on schema community_private from public, anon, authenticated;
grant usage on schema community_private to anon, authenticated, service_role;

-- Closed until the operator publishes final policies. Also enforced on direct API calls.
create table community_private.launch_settings (
 singleton boolean primary key default true check(singleton),
 policies_published boolean not null default false
);
insert into community_private.launch_settings(singleton) values(true);
alter table community_private.launch_settings enable row level security;

create table public.admission_waves (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_open boolean not null default false,
  capacity integer not null check (capacity > 0),
  admitted integer not null default 0 check (admitted >= 0),
  club_capacity integer not null default 1000 check (club_capacity > 0),
  created_at timestamptz not null default now()
);
create unique index admission_one_open_wave on public.admission_waves (is_open) where is_open;
insert into public.admission_waves(name,is_open,capacity) values ('First Generation',true,20000);
create table community_private.admission_counters (
  wave_id uuid not null references public.admission_waves(id),
  club_key text not null,
  admitted integer not null default 0,
  primary key (wave_id,club_key)
);
create table public.community_memberships (
  user_id uuid primary key references public.user_profiles(id) on delete cascade,
  state text not null check (state in ('active','waitlisted','frozen','suspended','deleted')),
  wave_id uuid not null references public.admission_waves(id),
  club_id uuid references public.clubs(id),
  seat_number integer,
  writer_status text not null default 'Supporter' check (writer_status in ('Supporter','Regular','Club Voice','Leading Voice','Club Captain')),
  admitted_at timestamptz,
  deletion_previous_state text,
  deletion_requested_at timestamptz,
  deletion_due_at timestamptz,
  created_at timestamptz not null default now()
);
create index community_memberships_wave_club_idx on public.community_memberships(wave_id,club_id);
create index community_memberships_due_idx on public.community_memberships(deletion_due_at) where state='frozen';
create table public.legal_acceptances (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  document text not null check (document in ('terms','privacy','rules')),
  version text not null,
  accepted_at timestamptz not null default now(),
  primary key(user_id,document,version)
);
create table community_private.staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check(role in ('moderator','admin')),
  assigned_at timestamptz not null default now()
);
create table community_private.quota_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  club_key text,
  target_id uuid,
  created_at timestamptz not null default now()
);
create index quota_events_user_time_idx on community_private.quota_events(user_id,created_at,kind);
create table public.saved_topics (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,topic_id)
);
create index saved_topics_topic_idx on public.saved_topics(topic_id);
create table public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.forum_topics(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index community_notifications_user_idx on public.community_notifications(user_id,created_at desc);
create index community_notifications_topic_idx on public.community_notifications(topic_id);
create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  subject_user_id uuid references auth.users(id) on delete set null,
  target_type text not null check(target_type in ('entry','comment')),
  target_id uuid not null,
  reason text not null check(reason in ('abuse','hate','threat','spam','privacy','copyright','illegal','other')),
  details text not null check(length(details) between 10 and 2000),
  status text not null default 'open' check(status in ('open','actioned','dismissed','appealed')),
  decision text,
  appeal text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique(reporter_id,target_type,target_id)
);
create index content_reports_queue_idx on public.content_reports(status,created_at);
create table community_private.report_evidence (
  report_id uuid primary key references public.content_reports(id) on delete cascade,
  body text not null,
  author_id uuid,
  expires_at timestamptz not null default now()+interval '90 days'
);
create table community_private.moderation_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  report_id uuid,
  action text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create table community_private.legal_holds (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check(target_type in ('entry','comment','account')),
  target_id uuid not null,
  reason text not null check(length(reason)>=10),
  authorised_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check(expires_at > created_at)
);
create index legal_holds_target_idx on community_private.legal_holds(target_type,target_id,expires_at);
create table community_private.club_asset_licenses (
  club_id uuid primary key references public.clubs(id),
  asset_url text not null check(asset_url ~ '^https://'),
  rights_holder text not null,
  permission_reference text not null,
  valid_until timestamptz not null,
  approved_by uuid not null references auth.users(id),
  approved_at timestamptz not null default now()
);

-- No new anonymous or owner writes to operational tables: all changes use checked RPCs.
alter table public.admission_waves enable row level security;
alter table public.community_memberships enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.saved_topics enable row level security;
alter table public.community_notifications enable row level security;
alter table public.content_reports enable row level security;
alter table community_private.admission_counters enable row level security;
alter table community_private.staff_roles enable row level security;
alter table community_private.quota_events enable row level security;
alter table community_private.report_evidence enable row level security;
alter table community_private.moderation_log enable row level security;
alter table community_private.legal_holds enable row level security;
alter table community_private.club_asset_licenses enable row level security;
revoke all on all tables in schema community_private from anon,authenticated;
grant select on public.admission_waves to anon,authenticated;
grant select on public.community_memberships,public.legal_acceptances,public.saved_topics,public.community_notifications,public.content_reports to authenticated;
create policy waves_public_read on public.admission_waves for select using(true);
create policy membership_owner_read on public.community_memberships for select to authenticated using(user_id=(select auth.uid()));
create policy acceptance_owner_read on public.legal_acceptances for select to authenticated using(user_id=(select auth.uid()));
create policy saved_owner_read on public.saved_topics for select to authenticated using(user_id=(select auth.uid()));
create policy notification_owner_read on public.community_notifications for select to authenticated using(user_id=(select auth.uid()));
create policy reports_owner_read on public.content_reports for select to authenticated using(reporter_id=(select auth.uid()));

-- Preserve existing members, giving each an immutable seat in registration order.
insert into public.community_memberships(user_id,state,wave_id,club_id,seat_number,admitted_at)
select p.id,case when p.account_deleted_at is null then 'active' else 'deleted' end,w.id,p.primary_club_id,
 row_number() over(partition by p.primary_club_id order by p.created_at,p.id),p.created_at
from public.user_profiles p cross join public.admission_waves w where p.onboarding_completed;
insert into community_private.admission_counters(wave_id,club_key,admitted)
select wave_id,coalesce(club_id::text,'neutral'),count(*) from public.community_memberships group by wave_id,club_id;
update public.admission_waves w set admitted=(select count(*) from public.community_memberships m where m.wave_id=w.id);

create function community_private.is_active(p_user uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.community_memberships where user_id=p_user and state='active')
$$;
create function community_private.is_staff() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from community_private.staff_roles where user_id=auth.uid())
$$;
create function community_private.assert_active() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not community_private.is_active(auth.uid()) then raise exception 'membership_inactive' using errcode='42501'; end if;
 if (select count(*) from public.legal_acceptances where user_id=auth.uid() and version='2026-09-05')<>3 then raise exception 'legal_acceptance_required' using errcode='42501'; end if;
end $$;
create function public.community_is_staff() returns boolean language sql security invoker set search_path='' as $$ select community_private.is_staff() $$;

alter table public.forum_entries add column deleted_at timestamptz, add column purged_at timestamptz, add column deletion_origin text;
alter table public.forum_comments add column deleted_at timestamptz, add column purged_at timestamptz, add column deletion_origin text,
 add column reply_to_comment_id uuid references public.forum_comments(id) on delete set null;
create index forum_comments_reply_to_idx on public.forum_comments(reply_to_comment_id);
alter table public.forum_topics add column status text not null default 'active' check(status in ('active','hidden','deleted'));

create function community_private.consume_quota(p_kind text,p_club uuid,p_target uuid) returns void language plpgsql security definer set search_path='' as $$
declare used integer; cap integer; away boolean; day_start timestamptz := date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
begin
 perform community_private.assert_active();
 perform pg_advisory_xact_lock(hashtextextended('community-user:'||auth.uid()::text,0));
 cap:=case p_kind when 'topic' then 5 when 'post' then 30 when 'reply' then 60 when 'rating' then 100 when 'report' then 10 else 0 end;
 select count(*) into used from community_private.quota_events where user_id=auth.uid() and kind=p_kind and created_at>=day_start;
 if used>=cap then raise exception '%',case when p_kind='report' then 'report_limit' else 'daily_'||p_kind||'_limit' end using errcode='23514'; end if;
 if p_kind in ('post','reply','topic') and exists(select 1 from community_private.quota_events where user_id=auth.uid() and kind in ('post','reply','topic') and created_at>now()-interval '10 seconds') then raise exception 'slow_down' using errcode='23514'; end if;
 away:=p_club is not null and not public.user_has_forum_club_relation(auth.uid(),p_club,null);
 if away and p_kind in ('post','reply') then
  select count(*) into used from community_private.quota_events where user_id=auth.uid() and kind=p_kind and club_key=p_club::text and created_at>=day_start;
  if used >= (case when p_kind='post' then 1 else 3 end) then raise exception '%','away_'||p_kind||'_limit' using errcode='23514'; end if;
 end if;
 insert into community_private.quota_events(user_id,kind,club_key,target_id) values(auth.uid(),p_kind,p_club::text,p_target);
end $$;

-- Canonical club IDs only; suggested club names never grant writing privileges.
create or replace function public.user_has_forum_club_relation(p_user_id uuid,p_club_id uuid,p_club_name text) returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.user_profiles where id=p_user_id and primary_club_id=p_club_id)
 or exists(select 1 from public.user_supported_clubs where user_id=p_user_id and club_id=p_club_id)
$$;
create or replace function public.enforce_forum_topic_club_permission() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then return new; end if;
 if new.author_id<>auth.uid() then raise exception 'permission denied' using errcode='42501'; end if;
 if new.club_id is null and new.club_name is not null then select id into new.club_id from public.clubs where lower(name)=lower(new.club_name) and active; if new.club_id is null then raise exception 'club_permission'; end if; end if;
 if new.club_id is not null then
  if not public.user_has_forum_club_relation(auth.uid(),new.club_id,null) then raise exception 'club_permission' using errcode='42501'; end if;
  select name into new.club_name from public.clubs where id=new.club_id and active;
  if new.club_name is null then raise exception 'club_permission'; end if;
 end if;
 new.created_at:=now(); new.status:='active';
 perform community_private.consume_quota('topic',new.club_id,new.id);
 return new;
end $$;
create or replace function public.validate_forum_entry() returns trigger language plpgsql security definer set search_path='' as $$
declare t public.forum_topics; previous_id uuid; other_posts integer;
begin
 if auth.uid() is null then return new; end if;
 if new.author_id<>auth.uid() or new.status<>'active' then raise exception 'permission denied' using errcode='42501'; end if;
 perform community_private.assert_active();
 perform pg_advisory_xact_lock(hashtextextended('community-user:'||auth.uid()::text,0));
 select * into t from public.forum_topics where id=new.topic_id for update;
 if t.id is null or t.status<>'active' then raise exception 'content_unavailable'; end if;
 new.created_at:=now(); new.deleted_at:=null; new.purged_at:=null; new.deletion_origin:=null;
 if new.is_opening then
  if new.author_id<>t.author_id then raise exception 'opening author mismatch'; end if;
 else
  select id into previous_id from public.forum_entries where topic_id=new.topic_id and author_id=auth.uid() order by created_at desc,id desc limit 1;
  if previous_id is not null then
   select count(*) into other_posts from public.forum_entries e where e.topic_id=new.topic_id and e.author_id<>auth.uid() and e.status='active' and e.created_at>(select created_at from public.forum_entries where id=previous_id);
   if other_posts<2 then raise exception 'post_spacing' using errcode='23514'; end if;
  end if;
  perform community_private.consume_quota('post',t.club_id,new.id);
 end if;
 return new;
end $$;
create or replace function public.validate_forum_comment() returns trigger language plpgsql security definer set search_path='' as $$
declare t public.forum_topics; parent public.forum_comments;
begin
 if tg_op='UPDATE' then return new; end if;
 if auth.uid() is null then return new; end if;
 if new.author_id<>auth.uid() or new.status<>'active' then raise exception 'permission denied' using errcode='42501'; end if;
 perform community_private.assert_active();
 select * into t from public.forum_topics where id=new.topic_id;
 if t.id is null or t.status<>'active' or not exists(select 1 from public.forum_entries where id=new.entry_id and topic_id=new.topic_id and status='active') then raise exception 'content_unavailable'; end if;
 if new.reply_to_comment_id is not null then
  select * into parent from public.forum_comments where id=new.reply_to_comment_id;
  if parent.id is null or parent.entry_id<>new.entry_id or parent.status<>'active' then raise exception 'content_unavailable'; end if;
 end if;
 new.created_at:=now(); new.deleted_at:=null; new.purged_at:=null; new.deletion_origin:=null;
 perform community_private.consume_quota('reply',t.club_id,new.id);
 return new;
end $$;
-- Remove direct editing/deleting endpoints that could evade retention or move replies.
revoke update,delete on public.forum_comments,public.forum_entries,public.forum_topics from authenticated;
drop policy if exists "Users can update their own comments" on public.forum_comments;
drop policy if exists "Users can delete their own comments" on public.forum_comments;
create function community_private.validate_rating() returns trigger language plpgsql security definer set search_path='' as $$
declare owner_id uuid; target_status text;
begin
 perform community_private.assert_active();
 if new.user_id<>auth.uid() then raise exception 'permission denied'; end if;
 if tg_op='UPDATE' and (new.user_id<>old.user_id or new.target_id<>old.target_id or new.target_type<>old.target_type) then raise exception 'rating target is immutable'; end if;
 if new.target_type='entry' then select author_id,status into owner_id,target_status from public.forum_entries where id=new.target_id;
 elsif new.target_type='comment' then select author_id,status into owner_id,target_status from public.forum_comments where id=new.target_id;
 else select author_id,status into owner_id,target_status from public.forum_topics where id=new.target_id; end if;
 if new.target_type='comment' and not exists(select 1 from public.forum_comments c join public.forum_entries e on e.id=c.entry_id join public.forum_topics t on t.id=c.topic_id where c.id=new.target_id and e.status='active' and t.status='active') then raise exception 'content_unavailable'; end if;
 if new.target_type='entry' and not exists(select 1 from public.forum_entries e join public.forum_topics t on t.id=e.topic_id where e.id=new.target_id and t.status='active') then raise exception 'content_unavailable'; end if;
 if owner_id is null or target_status<>'active' or not community_private.is_active(owner_id) then raise exception 'content_unavailable'; end if;
 if owner_id=auth.uid() then raise exception 'self_rating' using errcode='23514'; end if;
 -- Upsert runs BEFORE INSERT even for an existing score: charge only new targets.
 if not exists(select 1 from public.forum_ratings where user_id=new.user_id and target_id=new.target_id and target_type=new.target_type) then perform community_private.consume_quota('rating',null,new.target_id); end if;
 new.created_at:=case when tg_op='UPDATE' then old.created_at else now() end;
 return new;
end $$;
create trigger community_rating_guard before insert or update on public.forum_ratings for each row execute function community_private.validate_rating();

create function community_private.accept_agreements(p_terms text,p_privacy text,p_rules text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'sign in required'; end if;
 if not (select policies_published from community_private.launch_settings where singleton) then raise exception 'Our launch policies are still being finalised.'; end if;
 if p_terms is distinct from '2026-09-05' or p_privacy is distinct from '2026-09-05' or p_rules is distinct from '2026-09-05' then raise exception 'legal_acceptance_required'; end if;
 insert into public.legal_acceptances(user_id,document,version) values(auth.uid(),'terms',p_terms),(auth.uid(),'privacy',p_privacy),(auth.uid(),'rules',p_rules) on conflict do nothing;
end $$;
create function public.accept_community_agreements(p_terms text,p_privacy text,p_rules text) returns void language sql security invoker set search_path='' as $$ select community_private.accept_agreements(p_terms,p_privacy,p_rules) $$;

-- Profiles and supported clubs are written atomically through this boundary.
revoke insert,update,delete on public.user_profiles,public.user_supported_clubs,public.user_private_settings from authenticated;
create function community_private.save_identity(p_input jsonb,p_join boolean) returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.user_profiles; m public.community_memberships; w public.admission_waves;
 primary_id uuid:=(p_input->>'primaryClubId')::uuid; secondary_ids uuid[]; v_club_key text; seat integer; new_state text; now_at timestamptz:=now(); changed boolean;
begin
 if length(coalesce(p_input->>'displayName',''))>60 or length(coalesce(p_input->>'preferredLanguage','en'))>10 then raise exception 'Invalid profile details.'; end if;
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Verify your email before joining.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('community-user:'||uid::text,0));
 select * into p from public.user_profiles where id=uid;
 select * into m from public.community_memberships where user_id=uid;
 select coalesce(array_agg(value::uuid),array[]::uuid[]) into secondary_ids from jsonb_array_elements_text(coalesce(p_input->'secondaryClubIds','[]'::jsonb));
 if cardinality(secondary_ids)>3 or cardinality(secondary_ids)<>(select count(distinct x) from unnest(secondary_ids) x) or primary_id=any(secondary_ids) then raise exception 'Choose up to three different followed clubs.'; end if;
 if exists(select 1 from unnest(array_append(secondary_ids,primary_id)) x where x is not null and not exists(select 1 from public.clubs where id=x and active)) then raise exception 'Choose a club from the current catalog.'; end if;
 if exists(select league_id from public.club_league_memberships where is_current and club_id=any(array_append(secondary_ids,primary_id)) group by league_id having count(distinct club_id)>1) then raise exception 'Choose only one club per league.'; end if;
 if p_join then
  if m.state in ('active','frozen','suspended','deleted') then return m.state; end if;
  if coalesce((p_input->>'is18PlusConfirmed')::boolean,false)=false then raise exception 'Confirm that you are 18 or older.'; end if;
  if p_input->>'termsVersion' is distinct from '2026-09-05' or p_input->>'privacyVersion' is distinct from '2026-09-05' or p_input->>'rulesVersion' is distinct from '2026-09-05' then raise exception 'legal_acceptance_required'; end if;
  select * into w from public.admission_waves where is_open for update;
  if w.id is null then select * into w from public.admission_waves order by created_at desc limit 1 for update; end if;
  v_club_key:=coalesce(primary_id::text,'neutral');
  insert into community_private.admission_counters(wave_id,club_key) values(w.id,v_club_key) on conflict do nothing;
  select admitted into seat from community_private.admission_counters c where c.wave_id=w.id and c.club_key=v_club_key for update;
  new_state:=case when w.is_open and w.admitted<w.capacity and seat<w.club_capacity then 'active' else 'waitlisted' end;
  if new_state='active' then
   seat:=seat+1;
   update community_private.admission_counters c set admitted=seat where c.wave_id=w.id and c.club_key=v_club_key;
   update public.admission_waves set admitted=admitted+1 where id=w.id;
  else seat:=null; end if;
  insert into public.user_profiles(id,username,primary_club_id,preferred_language,onboarding_completed,is_18_plus_confirmed,community_rules_accepted_at,generation_id,fan_club_selected_at,liked_clubs_updated_at)
  values(uid,lower(trim(p_input->>'username')),primary_id,coalesce(p_input->>'preferredLanguage','en'),new_state='active',true,now_at,
   (select id from public.generations where slug='first-generation-writer' limit 1),case when primary_id is not null then now_at end,case when cardinality(secondary_ids)>0 then now_at end)
  on conflict(id) do update set username=excluded.username,primary_club_id=excluded.primary_club_id,onboarding_completed=excluded.onboarding_completed,is_18_plus_confirmed=true,community_rules_accepted_at=now_at;
  insert into public.community_memberships(user_id,state,wave_id,club_id,seat_number,admitted_at) values(uid,new_state,w.id,primary_id,seat,case when new_state='active' then now_at end)
  on conflict(user_id) do update set state=excluded.state,wave_id=excluded.wave_id,club_id=excluded.club_id,seat_number=excluded.seat_number,admitted_at=excluded.admitted_at;
  perform community_private.accept_agreements(p_input->>'termsVersion',p_input->>'privacyVersion',p_input->>'rulesVersion');
 else
  perform community_private.assert_active();
  -- Admission club and founding place are fixed; correction requires staff review.
  if primary_id is distinct from p.primary_club_id then raise exception 'Your FAN club is fixed after admission. Contact the community team for a correction.'; end if;
  changed:=not (secondary_ids @> array(select club_id from public.user_supported_clubs where user_id=uid) and secondary_ids <@ array(select club_id from public.user_supported_clubs where user_id=uid));
  if changed and p.liked_clubs_updated_at>now_at-interval '21 days' then raise exception 'You can change followed clubs once every 21 days.'; end if;
  update public.user_profiles set username=lower(trim(p_input->>'username')),display_name=nullif(trim(p_input->>'displayName'),''),preferred_language=coalesce(p_input->>'preferredLanguage','en'),liked_clubs_updated_at=case when changed then now_at else liked_clubs_updated_at end where id=uid;
  new_state:='active';
 end if;
 delete from public.user_supported_clubs where user_id=uid;
 insert into public.user_supported_clubs(user_id,club_id,support_type) select uid,x,'secondary' from unnest(secondary_ids) x;
 insert into public.user_private_settings(user_id,interface_language,email_notifications_enabled) values(uid,coalesce(p_input->>'preferredLanguage','en'),false) on conflict(user_id) do update set interface_language=excluded.interface_language;
 return new_state;
end $$;
create function public.save_community_identity(p_input jsonb,p_join boolean) returns text language sql security invoker set search_path='' as $$ select community_private.save_identity(p_input,p_join) $$;
create function community_private.admission_status(p_club uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('name',w.name,'open',w.is_open,'capacity',w.club_capacity,'claimed',coalesce(c.admitted,0),'remaining',case when w.is_open then greatest(0,least(w.club_capacity-coalesce(c.admitted,0),w.capacity-w.admitted)) else 0 end)
 from public.admission_waves w left join community_private.admission_counters c on c.wave_id=w.id and c.club_key=coalesce(p_club::text,'neutral') order by w.created_at desc limit 1
$$;
create function public.community_admission_status(p_club uuid default null) returns jsonb language sql security invoker set search_path='' as $$ select community_private.admission_status(p_club) $$;

create table community_private.recycle_bin (
 kind text not null check(kind in ('entry','comment')),target_id uuid not null,user_id uuid not null references auth.users(id) on delete cascade,
 body text not null,expires_at timestamptz not null default now()+interval '30 days',origin text not null,
 primary key(kind,target_id)
);
alter table community_private.recycle_bin enable row level security;
create index recycle_bin_owner_idx on community_private.recycle_bin(user_id,expires_at);
-- Previously deleted records must never become readable when tombstones are enabled.
insert into community_private.recycle_bin(kind,target_id,user_id,body,origin,expires_at)
select 'entry',id,author_id,body,'legacy',now()+interval '30 days' from public.forum_entries where status='deleted' and body<>'[Deleted post]'
union all select 'comment',id,author_id,body,'legacy',now()+interval '30 days' from public.forum_comments where status='deleted' and body<>'[Deleted post]';
update public.forum_entries set body='[Deleted post]',deleted_at=now(),deletion_origin='legacy' where status='deleted';
update public.forum_comments set body='[Deleted post]',deleted_at=now(),deletion_origin='legacy' where status='deleted';

create function community_private.move_content(p_kind text,p_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid; content_body text; content_status text; saved community_private.recycle_bin; tbl text;
begin
 if auth.uid() is null then raise exception 'sign in required'; end if;
 if p_kind not in ('entry','comment') or p_action not in ('delete','restore','purge') then raise exception 'invalid action'; end if;
 tbl:=case when p_kind='entry' then 'forum_entries' else 'forum_comments' end;
 perform pg_advisory_xact_lock(hashtextextended('community-user:'||auth.uid()::text,0));
 execute format('select author_id,body,status from public.%I where id=$1 for update',tbl) into owner_id,content_body,content_status using p_id;
 if owner_id is distinct from auth.uid() then raise exception 'permission denied' using errcode='42501'; end if;
 if p_action='delete' then
  if content_status='deleted' then return; end if;
  if content_status<>'active' then raise exception 'This post is under review.'; end if;
  insert into community_private.recycle_bin(kind,target_id,user_id,body,origin) values(p_kind,p_id,auth.uid(),content_body,'owner');
  execute format('update public.%I set body=$2,status=''deleted'',deleted_at=now(),deletion_origin=''owner'' where id=$1',tbl) using p_id,'[Deleted post]';
 elsif p_action='restore' then
  perform community_private.assert_active();
  select * into saved from community_private.recycle_bin where kind=p_kind and target_id=p_id for update;
  if saved.target_id is null or saved.expires_at<=now() then raise exception 'restore_expired'; end if;
  if content_status<>'deleted' or exists(select 1 from public.content_reports where target_type=p_kind and target_id=p_id and status='actioned') then raise exception 'This post is under review.'; end if;
  execute format('update public.%I set body=$2,status=''active'',deleted_at=null,deletion_origin=null where id=$1',tbl) using p_id,saved.body;
  delete from community_private.recycle_bin where kind=p_kind and target_id=p_id;
 else
  if content_status<>'deleted' then raise exception 'Delete the post before permanently erasing it.'; end if;
  if exists(select 1 from community_private.legal_holds where ((target_type=p_kind and target_id=p_id) or (target_type='account' and target_id=auth.uid())) and expires_at>now()) then raise exception 'This record is subject to a documented legal hold.'; end if;
  delete from community_private.recycle_bin where kind=p_kind and target_id=p_id;
  execute format('update public.%I set purged_at=now() where id=$1',tbl) using p_id;
 end if;
end $$;
create function public.manage_community_content(p_kind text,p_id uuid,p_action text) returns void language sql security invoker set search_path='' as $$ select community_private.move_content(p_kind,p_id,p_action) $$;
create function community_private.own_activity(p_deleted boolean,p_offset integer) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(row_to_json(x)),'[]'::jsonb) from (
 select e.id,'entry'::text kind,e.topic_id,t.title topic_title,coalesce(b.body,e.body) body,e.status,e.created_at,e.deleted_at,e.is_opening
 from public.forum_entries e join public.forum_topics t on t.id=e.topic_id left join community_private.recycle_bin b on b.kind='entry' and b.target_id=e.id and b.user_id=auth.uid()
 where e.author_id=auth.uid() and ((p_deleted and e.status='deleted' and e.purged_at is null and b.expires_at>now()) or (not p_deleted and e.status<>'deleted'))
 union all
 select c.id,'comment',c.topic_id,t.title,coalesce(b.body,c.body),c.status,c.created_at,c.deleted_at,false
 from public.forum_comments c join public.forum_topics t on t.id=c.topic_id left join community_private.recycle_bin b on b.kind='comment' and b.target_id=c.id and b.user_id=auth.uid()
 where c.author_id=auth.uid() and ((p_deleted and c.status='deleted' and c.purged_at is null and b.expires_at>now()) or (not p_deleted and c.status<>'deleted'))
 order by created_at desc,id limit 30 offset greatest(0,least(p_offset,100000))
 ) x
$$;
create function public.community_own_activity(p_deleted boolean default false,p_offset integer default 0) returns jsonb language sql security invoker set search_path='' as $$ select community_private.own_activity(p_deleted,p_offset) $$;

create function community_private.report_content(p_kind text,p_id uuid,p_reason text,p_details text) returns uuid language plpgsql security definer set search_path='' as $$
declare content_body text; owner_id uuid; report_id uuid;
begin
 perform community_private.assert_active();
 if exists(select 1 from public.content_reports where reporter_id=auth.uid() and target_type=p_kind and target_id=p_id) then raise exception 'already_reported'; end if;
 if p_kind='entry' then select body,author_id into content_body,owner_id from public.forum_entries where id=p_id and status='active';
 elsif p_kind='comment' then select body,author_id into content_body,owner_id from public.forum_comments where id=p_id and status='active'; end if;
 if owner_id is null then raise exception 'content_unavailable'; end if;
 perform community_private.consume_quota('report',null,p_id);
 insert into public.content_reports(reporter_id,subject_user_id,target_type,target_id,reason,details) values(auth.uid(),owner_id,p_kind,p_id,p_reason,trim(p_details)) returning id into report_id;
 insert into community_private.report_evidence(report_id,body,author_id) values(report_id,content_body,owner_id);
 return report_id;
end $$;
create function public.report_community_content(p_kind text,p_id uuid,p_reason text,p_details text) returns uuid language sql security invoker set search_path='' as $$ select community_private.report_content(p_kind,p_id,p_reason,p_details) $$;

create function community_private.moderation_queue() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not community_private.is_staff() then raise exception 'permission denied' using errcode='42501'; end if;
 select coalesce(jsonb_agg(row_to_json(x)),'[]') into result from (select r.*,e.body as evidence from public.content_reports r left join community_private.report_evidence e on e.report_id=r.id order by case when r.status in ('open','appealed') then 0 else 1 end,r.created_at limit 100) x;
 return result;
end $$;
create function public.community_moderation_queue() returns jsonb language sql security invoker set search_path='' as $$ select community_private.moderation_queue() $$;
create function community_private.resolve_report(p_id uuid,p_action text,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare r public.content_reports; owner_id uuid; t_id uuid;
begin
 if not community_private.is_staff() then raise exception 'permission denied' using errcode='42501'; end if;
 if p_action not in ('hide','dismiss','restore') or length(trim(p_reason)) not between 10 and 2000 then raise exception 'Add a clear decision reason (10–2000 characters).'; end if;
 select * into r from public.content_reports where id=p_id for update;
 if r.id is null then raise exception 'report not found'; end if;
 if r.target_type='entry' then
  select author_id,topic_id into owner_id,t_id from public.forum_entries where id=r.target_id;
  if p_action='hide' then update public.forum_entries set status='hidden' where id=r.target_id and status='active'; end if;
  if p_action='restore' then update public.forum_entries set status=case when deleted_at is null then 'active' else 'deleted' end where id=r.target_id and status='hidden'; end if;
 else
  select author_id,topic_id into owner_id,t_id from public.forum_comments where id=r.target_id;
  if p_action='hide' then update public.forum_comments set status='hidden' where id=r.target_id and status='active'; end if;
  if p_action='restore' then update public.forum_comments set status=case when deleted_at is null then 'active' else 'deleted' end where id=r.target_id and status='hidden'; end if;
 end if;
 update public.content_reports set status=case when p_action='hide' then 'actioned' else 'dismissed' end,decision=trim(p_reason),resolved_at=now() where id=p_id;
 insert into community_private.moderation_log(actor_id,report_id,action,reason) values(auth.uid(),p_id,p_action,trim(p_reason));
 insert into public.community_notifications(user_id,topic_id,message) values(r.reporter_id,t_id,'Your report was reviewed: '||trim(p_reason));
 if owner_id is not null and p_action<>'dismiss' then insert into public.community_notifications(user_id,topic_id,message) values(owner_id,t_id,'A decision was made about your post: '||trim(p_reason)||' You can appeal from your account.'); end if;
end $$;
create function public.resolve_community_report(p_id uuid,p_action text,p_reason text) returns void language sql security invoker set search_path='' as $$ select community_private.resolve_report(p_id,p_action,p_reason) $$;
create function community_private.appeal_report(p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or length(trim(p_reason)) not between 10 and 2000 then raise exception 'Describe your appeal (10–2000 characters).'; end if;
 update public.content_reports r set status='appealed',appeal=trim(p_reason) where id=p_id and resolved_at>now()-interval '180 days' and appeal is null and (reporter_id=auth.uid() or subject_user_id=auth.uid());
 if not found then raise exception 'This decision is not eligible for an appeal.'; end if;
end $$;
create function public.appeal_community_report(p_id uuid,p_reason text) returns void language sql security invoker set search_path='' as $$ select community_private.appeal_report(p_id,p_reason) $$;

create function community_private.save_topic(p_id uuid,p_saved boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform community_private.assert_active();
 if p_saved then
  if not exists(select 1 from public.forum_topics where id=p_id and status='active') then raise exception 'content_unavailable'; end if;
  insert into public.saved_topics(user_id,topic_id) values(auth.uid(),p_id) on conflict do nothing;
 else delete from public.saved_topics where user_id=auth.uid() and topic_id=p_id; end if;
end $$;
create function public.save_community_topic(p_id uuid,p_saved boolean) returns void language sql security invoker set search_path='' as $$ select community_private.save_topic(p_id,p_saved) $$;
create function community_private.read_notifications() returns void language sql security definer set search_path='' as $$ update public.community_notifications set read_at=now() where user_id=auth.uid() and read_at is null $$;
create function public.read_community_notifications() returns void language sql security invoker set search_path='' as $$ select community_private.read_notifications() $$;
create function community_private.notify_reply() returns trigger language plpgsql security definer set search_path='' as $$
declare recipient uuid;
begin
 if new.reply_to_comment_id is not null then select author_id into recipient from public.forum_comments where id=new.reply_to_comment_id;
 else select author_id into recipient from public.forum_entries where id=new.entry_id; end if;
 if recipient is not null and recipient<>new.author_id and community_private.is_active(recipient) then insert into public.community_notifications(user_id,topic_id,message) values(recipient,new.topic_id,'Someone replied to your post. Jump back into the conversation.'); end if;
 return new;
end $$;
create trigger community_reply_notification after insert on public.forum_comments for each row execute function community_private.notify_reply();

create function community_private.account_lifecycle(p_action text) returns void language plpgsql security definer set search_path='' as $$
declare m public.community_memberships; e record;
begin
 if auth.uid() is null then raise exception 'sign in required'; end if;
 perform pg_advisory_xact_lock(hashtextextended('community-user:'||auth.uid()::text,0));
 select * into m from public.community_memberships where user_id=auth.uid() for update;
 if p_action in ('delete','erase') then
  if not exists(select 1 from auth.users where id=auth.uid() and last_sign_in_at>now()-interval '15 minutes') then raise exception 'Sign in again before deleting your account.'; end if;
  if m.state not in ('active','waitlisted','suspended','frozen') then raise exception 'membership_inactive'; end if;
  if m.state<>'frozen' then
   for e in select id,'entry' kind from public.forum_entries where author_id=auth.uid() and status='active' union all select id,'comment' from public.forum_comments where author_id=auth.uid() and status='active' loop
    perform community_private.move_content(e.kind,e.id,'delete');
    update community_private.recycle_bin set origin='account' where kind=e.kind and target_id=e.id;
   end loop;
  end if;
  update public.community_memberships set deletion_previous_state=case when state='frozen' then deletion_previous_state else state end,state='frozen',deletion_requested_at=coalesce(deletion_requested_at,now()),deletion_due_at=case when p_action='erase' then now() else coalesce(deletion_due_at,now()+interval '30 days') end where user_id=auth.uid();
 elsif p_action='recover' then
  if m.state<>'frozen' or m.deletion_due_at<=now() then raise exception 'restore_expired'; end if;
  update public.community_memberships set state=coalesce(deletion_previous_state,case when seat_number is null then 'waitlisted' else 'active' end),deletion_requested_at=null,deletion_due_at=null,deletion_previous_state=null where user_id=auth.uid();
  for e in select kind,target_id,body from community_private.recycle_bin where user_id=auth.uid() and origin='account' and expires_at>now() loop
   if not exists(select 1 from public.content_reports where target_type=e.kind and target_id=e.target_id and status='actioned') then
    if e.kind='entry' then update public.forum_entries set body=e.body,status='active',deleted_at=null,deletion_origin=null where id=e.target_id and status='deleted';
    else update public.forum_comments set body=e.body,status='active',deleted_at=null,deletion_origin=null where id=e.target_id and status='deleted'; end if;
    delete from community_private.recycle_bin where kind=e.kind and target_id=e.target_id;
   end if;
  end loop;
 else raise exception 'invalid action'; end if;
end $$;
create function public.community_account_lifecycle(p_action text) returns void language sql security invoker set search_path='' as $$ select community_private.account_lifecycle(p_action) $$;

-- A service worker calls Auth Admin soft-delete only after these records are scrubbed.
create function community_private.retention_cleanup() returns jsonb language plpgsql security definer set search_path='' as $$
declare expired_row record; u record; due_users jsonb:='[]';
begin
 -- Lock order matches user actions: user advisory lock, then the affected row.
 for expired_row in select kind,target_id,user_id from community_private.recycle_bin where expires_at<=now() loop
  perform pg_advisory_xact_lock(hashtextextended('community-user:'||expired_row.user_id::text,0));
  if not exists(select 1 from community_private.recycle_bin b where b.kind=expired_row.kind and b.target_id=expired_row.target_id and b.expires_at<=now()) then continue; end if;
  if exists(select 1 from community_private.legal_holds h where ((h.target_type=expired_row.kind and h.target_id=expired_row.target_id) or (h.target_type='account' and h.target_id=expired_row.user_id)) and h.expires_at>now()) then continue; end if;
  if expired_row.kind='entry' then update public.forum_entries set purged_at=now() where id=expired_row.target_id and status='deleted';
  else update public.forum_comments set purged_at=now() where id=expired_row.target_id and status='deleted'; end if;
  delete from community_private.recycle_bin where kind=expired_row.kind and target_id=expired_row.target_id;
 end loop;
 for u in select user_id from public.community_memberships where state='frozen' and deletion_due_at<=now() loop
  perform pg_advisory_xact_lock(hashtextextended('community-user:'||u.user_id::text,0));
  perform 1 from public.community_memberships where user_id=u.user_id and state='frozen' and deletion_due_at<=now() for update;
  if not found then continue; end if;
  if exists(select 1 from community_private.legal_holds where target_type='account' and target_id=u.user_id and expires_at>now()) then continue; end if;
  -- A hold preserves restricted evidence, never a publicly visible copy.
  insert into community_private.recycle_bin(kind,target_id,user_id,body,origin,expires_at)
  select 'entry',e.id,e.author_id,e.body,'hold',max(h.expires_at) from public.forum_entries e join community_private.legal_holds h on h.target_type='entry' and h.target_id=e.id and h.expires_at>now() where e.author_id=u.user_id and e.body<>'[Deleted post]' group by e.id
  union all select 'comment',c.id,c.author_id,c.body,'hold',max(h.expires_at) from public.forum_comments c join community_private.legal_holds h on h.target_type='comment' and h.target_id=c.id and h.expires_at>now() where c.author_id=u.user_id and c.body<>'[Deleted post]' group by c.id
  on conflict(kind,target_id) do nothing;
  update public.forum_entries set body='[Deleted post]',status='deleted',deleted_at=coalesce(deleted_at,now()),purged_at=now() where author_id=u.user_id;
  update public.forum_comments set body='[Deleted post]',status='deleted',deleted_at=coalesce(deleted_at,now()),purged_at=now() where author_id=u.user_id;
  update public.forum_topics set title='[Removed topic]',source_url=null,source_domain=null,source_title=null where author_id=u.user_id;
  delete from community_private.recycle_bin b where user_id=u.user_id and not exists(select 1 from community_private.legal_holds h where h.target_type=b.kind and h.target_id=b.target_id and h.expires_at>now());
  update public.user_profiles set username='deleted_'||left(replace(u.user_id::text,'-',''),16),display_name='Deleted user',primary_club_id=null,primary_club_suggestion_id=null,national_team_id=null,national_team_suggestion_id=null,generation_id=null,current_title_id=null,selected_badge_id=null,preferred_language='en',xp=0,level=1,reputation_score=0,account_deleted_at=now(),is_18_plus_confirmed=false,community_rules_accepted_at=null,fan_club_selected_at=null,liked_clubs_updated_at=null where id=u.user_id;
  delete from public.user_private_settings where user_id=u.user_id;
  delete from public.user_supported_clubs where user_id=u.user_id;
  delete from public.user_badges where user_id=u.user_id;
  delete from public.xp_events where user_id=u.user_id;
  delete from public.forum_ratings where user_id=u.user_id;
  delete from public.saved_topics where user_id=u.user_id;
  delete from public.community_notifications where user_id=u.user_id;
  delete from public.legal_acceptances where user_id=u.user_id;
  delete from public.club_suggestions where user_id=u.user_id;
  delete from community_private.quota_events where user_id=u.user_id;
  -- Mark app deletion, but keep due date for idempotent Auth cleanup retries.
  update public.community_memberships set state='deleted',club_id=null,writer_status='Supporter' where user_id=u.user_id;
 end loop;
 delete from community_private.report_evidence e where expires_at<=now() and not exists(select 1 from public.content_reports r join community_private.legal_holds h on h.target_type=r.target_type and h.target_id=r.target_id and h.expires_at>now() where r.id=e.report_id);
 delete from public.community_notifications where created_at<now()-interval '90 days';
 delete from community_private.quota_events where created_at<now()-interval '2 days';
 delete from public.content_reports where resolved_at<now()-interval '180 days' and not exists(select 1 from community_private.report_evidence e where e.report_id=content_reports.id);
 delete from community_private.moderation_log where created_at<now()-interval '365 days';
 select coalesce(jsonb_agg(user_id),'[]') into due_users from public.community_memberships where state='deleted' and deletion_due_at is not null;
 return due_users;
end $$;
create function public.community_retention_cleanup() returns jsonb language sql security invoker set search_path='' as $$ select community_private.retention_cleanup() $$;
create function community_private.auth_cleanup_done(p_user uuid) returns void language sql security definer set search_path='' as $$ update public.community_memberships set deletion_due_at=null where user_id=p_user and state='deleted' $$;
create function public.community_auth_cleanup_done(p_user uuid) returns void language sql security invoker set search_path='' as $$ select community_private.auth_cleanup_done(p_user) $$;

create function community_private.export_data() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'exported_at',now(),'profile',(select to_jsonb(p) from public.user_profiles p where id=auth.uid()),
 'membership',(select to_jsonb(m) from public.community_memberships m where user_id=auth.uid()),
 'settings',(select to_jsonb(s) from public.user_private_settings s where user_id=auth.uid()),
 'followed_clubs',coalesce((select jsonb_agg(to_jsonb(s)) from public.user_supported_clubs s where user_id=auth.uid()),'[]'),
 'posts',coalesce((select jsonb_agg(to_jsonb(e)) from public.forum_entries e where author_id=auth.uid()),'[]'),
 'replies',coalesce((select jsonb_agg(to_jsonb(c)) from public.forum_comments c where author_id=auth.uid()),'[]'),
 'recently_deleted',coalesce((select jsonb_agg(jsonb_build_object('kind',b.kind,'id',b.target_id,'body',b.body,'expires_at',b.expires_at)) from community_private.recycle_bin b where user_id=auth.uid()),'[]'),
 'ratings',coalesce((select jsonb_agg(to_jsonb(r)) from public.forum_ratings r where user_id=auth.uid()),'[]'),
 'agreements',coalesce((select jsonb_agg(to_jsonb(a)) from public.legal_acceptances a where user_id=auth.uid()),'[]'),
 'saved_topics',coalesce((select jsonb_agg(to_jsonb(s)) from public.saved_topics s where user_id=auth.uid()),'[]'),
 'reports',coalesce((select jsonb_agg(to_jsonb(r)) from public.content_reports r where reporter_id=auth.uid()),'[]'))
 where auth.uid() is not null
$$;
create function public.export_community_data() returns jsonb language sql security invoker set search_path='' as $$ select community_private.export_data() $$;

-- Public content contains only active text or scrubbed tombstones. Hidden content never leaves the database boundary.
drop policy "Active forum entries are publicly readable" on public.forum_entries;
create policy community_entries_read on public.forum_entries for select using(status in ('active','deleted') and exists(select 1 from public.forum_topics t where t.id=topic_id and t.status='active'));
drop policy "Active forum comments are publicly readable" on public.forum_comments;
create policy community_comments_read on public.forum_comments for select using(status in ('active','deleted') and exists(select 1 from public.forum_entries e where e.id=entry_id and e.status in ('active','deleted')));
drop policy "Forum topics are publicly readable" on public.forum_topics;
create policy community_topics_read on public.forum_topics for select using(status='active');
create or replace view public.forum_entries_with_author with(security_invoker=true,security_barrier=true) as
select e.id,e.topic_id,e.body,e.is_opening,e.status,e.created_at,pp.username author_username,pp.display_name author_display_name,pp.primary_club_name author_club_name,pp.title_name author_title_name,pp.level author_level,
 pp.generation_name author_generation_name
from public.forum_entries e join public.public_profiles pp on pp.id=e.author_id where e.status in ('active','deleted');
create or replace view public.forum_comments_with_author with(security_invoker=true,security_barrier=true) as
select c.id,c.topic_id,c.entry_id,c.body,c.status,c.created_at,pp.username author_username,pp.display_name author_display_name,c.reply_to_comment_id,
 target_profile.username reply_to_username
from public.forum_comments c join public.public_profiles pp on pp.id=c.author_id
left join public.forum_comments target on target.id=c.reply_to_comment_id
left join public.public_profiles target_profile on target_profile.id=target.author_id
where c.status in ('active','deleted');

-- These two deliberate definer views are narrow public projections; raw identities/ratings remain private.
create or replace view public.public_profiles with(security_barrier=true) as
select p.id,
 case when m.state in ('frozen','deleted') then 'deleted_'||left(replace(p.id::text,'-',''),16) else p.username end username,
 case when m.state='frozen' then 'Deactivated member' when m.state='deleted' then 'Deleted user' else p.display_name end display_name,
 case when m.state in ('frozen','deleted') then null else c.name end primary_club_name,
 null::text national_team_name,
 case when m.state in ('frozen','deleted') then null else w.name end generation_name,
 1::integer level,case when m.state in ('frozen','deleted') then null else coalesce(m.writer_status,'Supporter') end title_name,
 null::text selected_badge_name,p.registration_year,
 case when m.state in ('frozen','deleted') then null else m.seat_number end founding_seat
from public.user_profiles p left join public.community_memberships m on m.user_id=p.id
left join public.admission_waves w on w.id=m.wave_id left join public.clubs c on c.id=p.primary_club_id
where p.onboarding_completed;
create or replace view public.forum_rating_summaries with(security_barrier=true) as
select r.target_type,r.target_id,round(avg(r.score)::numeric,1) average_score,count(*)::integer rating_count
from public.forum_ratings r where community_private.is_active(r.user_id) and (
(r.target_type='entry' and exists(select 1 from public.forum_entries e where e.id=r.target_id and e.status='active')) or
(r.target_type='comment' and exists(select 1 from public.forum_comments c where c.id=r.target_id and c.status='active')) or
(r.target_type='topic' and exists(select 1 from public.forum_topics t where t.id=r.target_id and t.status='active')))
group by r.target_type,r.target_id;

create function community_private.participation_budget(p_topic uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('postsRemaining',greatest(0,1-(select count(*) from community_private.quota_events q where q.user_id=auth.uid() and q.kind='post' and q.club_key=t.club_id::text and q.created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')),
 'repliesRemaining',greatest(0,3-(select count(*) from community_private.quota_events q where q.user_id=auth.uid() and q.kind='reply' and q.club_key=t.club_id::text and q.created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')))
 from public.forum_topics t where t.id=p_topic
$$;
create function public.community_participation_budget(p_topic uuid) returns jsonb language sql security invoker set search_path='' as $$ select community_private.participation_budget(p_topic) $$;

-- Ranking uses recent activity from the entire topic set, not just the latest 100 topics.
create function community_private.trending(p_limit integer) returns jsonb language sql stable security definer set search_path='' as $$
 with activity as (
 select topic_id,author_id,created_at from public.forum_entries where status='active' and created_at>now()-interval '7 days'
 union all select topic_id,author_id,created_at from public.forum_comments where status='active' and created_at>now()-interval '7 days'
 ), ranked as (
 select t.id,t.title,count(a.topic_id) interactions,count(distinct a.author_id) writers,greatest(t.created_at,max(a.created_at)) last_activity,
 (select count(*) from public.forum_entries e where e.topic_id=t.id and e.status='active') posts
 from public.forum_topics t left join activity a on a.topic_id=t.id where t.status='active' group by t.id
 )
 select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (select id,title,posts,interactions,writers,last_activity,
 (writers*4+ln(1+interactions)*3)/power(2+greatest(0,extract(epoch from(now()-last_activity))/3600),0.8) score
 from ranked order by score desc,last_activity desc,id limit greatest(1,least(p_limit,30))) x
$$;
create function public.community_trending(p_limit integer default 20) returns jsonb language sql security invoker set search_path='' as $$ select community_private.trending(p_limit) $$;

create function community_private.refresh_writer_statuses() returns void language sql security definer set search_path='' as $$
 with posts as (select author_id,count(*) n,count(distinct(created_at at time zone 'UTC')::date) days from public.forum_entries where status='active' group by author_id),
 ratings as (select e.author_id,count(distinct r.user_id) raters,avg(r.score) score from public.forum_entries e join public.forum_ratings r on r.target_type='entry' and r.target_id=e.id and r.user_id<>e.author_id where e.status='active' and community_private.is_active(r.user_id) group by e.author_id)
 update public.community_memberships m set writer_status=case
 when p.n>=150 and p.days>=90 and r.raters>=30 and r.score>=6 then 'Leading Voice'
 when p.n>=50 and p.days>=30 and r.raters>=10 and r.score>=6 then 'Club Voice'
 when p.n>=10 and p.days>=7 then 'Regular' else 'Supporter' end
 from public.user_profiles u left join posts p on p.author_id=u.id left join ratings r on r.author_id=u.id
 where m.user_id=u.id and m.state='active' and m.writer_status<>'Club Captain'
$$;

-- Least privilege: private functions are callable only through explicit invoker wrappers.
revoke execute on all functions in schema community_private from public,anon,authenticated;
grant execute on function community_private.is_active(uuid),community_private.admission_status(uuid),community_private.trending(integer) to anon,authenticated;
grant execute on function community_private.is_staff(),community_private.accept_agreements(text,text,text),community_private.save_identity(jsonb,boolean),community_private.move_content(text,uuid,text),community_private.own_activity(boolean,integer),community_private.report_content(text,uuid,text,text),community_private.moderation_queue(),community_private.resolve_report(uuid,text,text),community_private.appeal_report(uuid,text),community_private.save_topic(uuid,boolean),community_private.read_notifications(),community_private.account_lifecycle(text),community_private.export_data(),community_private.participation_budget(uuid) to authenticated;
grant execute on function community_private.retention_cleanup(),community_private.auth_cleanup_done(uuid),community_private.refresh_writer_statuses() to service_role;
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (p.proname like 'community_%' or p.proname in ('accept_community_agreements','save_community_identity','manage_community_content','report_community_content','resolve_community_report','appeal_community_report','save_community_topic','read_community_notifications','export_community_data')) loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
grant execute on function public.community_admission_status(uuid),public.community_trending(integer) to anon;
revoke execute on function public.community_retention_cleanup(),public.community_auth_cleanup_done(uuid) from authenticated;
grant execute on function public.community_retention_cleanup(),public.community_auth_cleanup_done(uuid) to service_role;

-- New tables never inherit broader dashboard default grants.
revoke insert,update,delete,truncate,references,trigger on public.admission_waves,public.community_memberships,public.legal_acceptances,public.saved_topics,public.community_notifications,public.content_reports from anon,authenticated;
revoke all on all tables in schema community_private from anon,authenticated;
notify pgrst,'reload schema';

create index content_reports_subject_idx on public.content_reports(subject_user_id);
create function community_private.my_reports() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (select id,target_type,target_id,reason,
 case when reporter_id=auth.uid() then details else 'A decision was made about your post.' end details,
 status,decision,appeal,created_at from public.content_reports where reporter_id=auth.uid() or (subject_user_id=auth.uid() and resolved_at is not null) order by created_at desc limit 50) x
$$;
create function public.community_my_reports() returns jsonb language sql security invoker set search_path='' as $$ select community_private.my_reports() $$;
revoke all on function community_private.my_reports(),public.community_my_reports() from public,anon;
grant execute on function community_private.my_reports(),public.community_my_reports() to authenticated;
