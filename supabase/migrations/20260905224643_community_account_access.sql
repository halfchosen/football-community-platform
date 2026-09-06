-- Internal erased identities use the full UUID so deletion cannot collide with another account.
alter table public.user_profiles drop constraint user_profiles_username_format;
alter table public.user_profiles add constraint user_profiles_username_format check(username ~ '^[a-z0-9_]{3,24}$' or username ~ '^(deleted|pending)_[a-f0-9]{32}$');
create or replace function community_private.account_lifecycle(p_action text) returns void language plpgsql security definer set search_path='' as $$
declare m public.community_memberships; e record;
begin
 if auth.uid() is null then raise exception 'sign in required'; end if;
 perform pg_advisory_xact_lock(hashtextextended('community-user:'||auth.uid()::text,0));
 select * into m from public.community_memberships where user_id=auth.uid() for update;
 if p_action in ('delete','erase') then
  if not exists(select 1 from auth.users where id=auth.uid() and last_sign_in_at>now()-interval '15 minutes') then raise exception 'Sign in again before deleting your account.'; end if;
  -- Privacy controls also cover Auth users who never finished onboarding.
  if m.user_id is null then
   insert into public.user_profiles(id,username,onboarding_completed) values(auth.uid(),'pending_'||replace(auth.uid()::text,'-',''),false) on conflict(id) do nothing;
   insert into public.community_memberships(user_id,state,wave_id) select auth.uid(),'waitlisted',id from public.admission_waves order by created_at desc limit 1;
   select * into m from public.community_memberships where user_id=auth.uid() for update;
  end if;
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
   if not exists(select 1 from public.content_reports where target_type=e.kind and target_id=e.target_id and status in ('actioned','appealed')) then
    if e.kind='entry' then update public.forum_entries set body=e.body,status='active',deleted_at=null,deletion_origin=null where id=e.target_id and status='deleted';
    else update public.forum_comments set body=e.body,status='active',deleted_at=null,deletion_origin=null where id=e.target_id and status='deleted'; end if;
    if found then delete from community_private.recycle_bin where kind=e.kind and target_id=e.target_id; end if;
   end if;
  end loop;
 else raise exception 'invalid action'; end if;
end $$;

create index if not exists community_memberships_club_idx on public.community_memberships(club_id);
create index if not exists content_reports_reporter_idx on public.content_reports(reporter_id);
create index if not exists legal_holds_authoriser_idx on community_private.legal_holds(authorised_by);
create index if not exists club_asset_approver_idx on community_private.club_asset_licenses(approved_by);
create index if not exists club_suggestions_country_idx on public.club_suggestions(country_id);
create index if not exists club_suggestions_league_idx on public.club_suggestions(league_id);

alter table community_private.moderation_log add column subject_user_id uuid;
create function community_private.member_directory(p_search text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not community_private.is_staff() then raise exception 'permission denied' using errcode='42501'; end if;
 select coalesce(jsonb_agg(to_jsonb(x)),'[]') into result from (
 select m.user_id,p.username,m.state,m.writer_status,w.name generation,m.seat_number,m.created_at
 from public.community_memberships m join public.user_profiles p on p.id=m.user_id join public.admission_waves w on w.id=m.wave_id
 where m.state<>'deleted' and (coalesce(trim(p_search),'')='' or p.username ilike '%'||left(trim(p_search),24)||'%')
 order by m.created_at desc limit 30) x;
 return result;
end $$;
create function public.community_member_directory(p_search text default '') returns jsonb language sql security invoker set search_path='' as $$ select community_private.member_directory(p_search) $$;
create function community_private.manage_member(p_user uuid,p_action text,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare m public.community_memberships;
begin
 if not community_private.is_staff() then raise exception 'permission denied' using errcode='42501'; end if;
 if p_reason is null or p_action is null or length(trim(p_reason)) not between 10 and 1000 or p_action not in ('suspend','resume','captain','remove_captain') then raise exception 'Enter a clear reason and valid action.'; end if;
 if exists(select 1 from community_private.staff_roles where user_id=p_user) then raise exception 'Staff accounts require a separate access review.'; end if;
 if p_action in ('captain','remove_captain') and not exists(select 1 from community_private.staff_roles where user_id=auth.uid() and role='admin') then raise exception 'Only an administrator can assign Club Captain.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('community-user:'||p_user::text,0));
 select * into m from public.community_memberships where user_id=p_user for update;
 if m.user_id is null or m.state not in ('active','suspended') then raise exception 'This account is not eligible for this action.'; end if;
 if p_action='suspend' then update public.community_memberships set state='suspended' where user_id=p_user;
 elsif p_action='resume' then update public.community_memberships set state='active' where user_id=p_user;
 elsif p_action='captain' then update public.community_memberships set writer_status='Club Captain' where user_id=p_user;
 else update public.community_memberships set writer_status='Supporter' where user_id=p_user; end if;
 insert into community_private.moderation_log(actor_id,subject_user_id,action,reason) values(auth.uid(),p_user,p_action,trim(p_reason));
 insert into public.community_notifications(user_id,message) values(p_user,'Membership review: '||p_action||'. '||trim(p_reason));
end $$;
create function public.community_manage_member(p_user uuid,p_action text,p_reason text) returns void language sql security invoker set search_path='' as $$ select community_private.manage_member(p_user,p_action,p_reason) $$;
create function community_private.configure_wave(p_name text,p_capacity integer,p_club_capacity integer,p_open boolean,p_new boolean) returns void language plpgsql security definer set search_path='' as $$
declare w public.admission_waves;
begin
 if not exists(select 1 from community_private.staff_roles where user_id=auth.uid() and role='admin') then raise exception 'Only an administrator can manage admission.' using errcode='42501'; end if;
 if p_capacity not between 1 and 100000 or p_club_capacity not between 1 and 10000 or p_club_capacity>p_capacity then raise exception 'Choose valid community and club capacities.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('community-admission-admin',0));
 select * into w from public.admission_waves order by created_at desc limit 1 for update;
 if p_new then
  if length(trim(p_name)) not between 3 and 60 then raise exception 'Name the new generation (3–60 characters).'; end if;
  update public.admission_waves set is_open=false where is_open;
  insert into public.admission_waves(name,capacity,club_capacity,is_open) values(trim(p_name),p_capacity,p_club_capacity,p_open);
 else
  if p_capacity<w.admitted or exists(select 1 from community_private.admission_counters where wave_id=w.id and admitted>p_club_capacity) then raise exception 'Capacity cannot be lower than places already claimed.'; end if;
  update public.admission_waves set capacity=p_capacity,club_capacity=p_club_capacity,is_open=p_open where id=w.id;
 end if;
 insert into community_private.moderation_log(actor_id,action,reason) values(auth.uid(),'admission','Wave configuration: capacity '||p_capacity||', club capacity '||p_club_capacity||', open '||p_open||', new wave '||p_new);
end $$;
create function public.community_configure_wave(p_name text,p_capacity integer,p_club_capacity integer,p_open boolean,p_new boolean) returns void language sql security invoker set search_path='' as $$ select community_private.configure_wave(p_name,p_capacity,p_club_capacity,p_open,p_new) $$;
revoke all on function community_private.member_directory(text),community_private.manage_member(uuid,text,text),community_private.configure_wave(text,integer,integer,boolean,boolean),public.community_member_directory(text),public.community_manage_member(uuid,text,text),public.community_configure_wave(text,integer,integer,boolean,boolean) from public,anon;
grant execute on function community_private.member_directory(text),community_private.manage_member(uuid,text,text),community_private.configure_wave(text,integer,integer,boolean,boolean),public.community_member_directory(text),public.community_manage_member(uuid,text,text),public.community_configure_wave(text,integer,integer,boolean,boolean) to authenticated;
notify pgrst,'reload schema';

-- Bound each stream response; replies have their own in-place pagination.
create function public.community_post_page(p_topic uuid,p_offset integer default 0) returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object(
  'replies',coalesce((select jsonb_agg(to_jsonb(c)) from (select * from public.forum_comments_with_author where entry_id=p.id order by created_at,id limit 10) c),'[]'),
  'reply_count',(select count(*) from public.forum_comments_with_author where entry_id=p.id)
 )),'[]') from (select * from public.forum_entries_with_author where topic_id=p_topic order by created_at,id limit 30 offset greatest(0,least(coalesce(p_offset,0),300000))) p
$$;
revoke all on function public.community_post_page(uuid,integer) from public;
grant execute on function public.community_post_page(uuid,integer) to anon,authenticated;

create or replace function community_private.retention_cleanup() returns jsonb language plpgsql security definer set search_path='' as $$
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
  update public.user_profiles set username='deleted_'||replace(u.user_id::text,'-',''),display_name='Deleted user',primary_club_id=null,primary_club_suggestion_id=null,national_team_id=null,national_team_suggestion_id=null,generation_id=null,current_title_id=null,selected_badge_id=null,preferred_language='en',xp=0,level=1,reputation_score=0,account_deleted_at=now(),is_18_plus_confirmed=false,community_rules_accepted_at=null,fan_club_selected_at=null,liked_clubs_updated_at=null where id=u.user_id;
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

create or replace function community_private.save_identity(p_input jsonb,p_join boolean) returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.user_profiles; m public.community_memberships; w public.admission_waves;
 primary_id uuid:=(p_input->>'primaryClubId')::uuid; secondary_ids uuid[]; v_club_key text; seat integer; new_state text; now_at timestamptz:=now(); changed boolean;
begin
 if lower(trim(p_input->>'username')) ~ '^(deleted|pending)_' then raise exception 'Choose another username. This prefix is reserved.'; end if;
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

create or replace function community_private.public_profiles() returns table(
 id uuid,username text,display_name text,primary_club_name text,national_team_name text,
 generation_name text,level integer,title_name text,selected_badge_name text,registration_year integer,founding_seat integer
) language sql stable security definer set search_path='' as $$
select p.id,
 case when m.state in ('frozen','deleted') then 'deleted_'||replace(p.id::text,'-','') else p.username end username,
 case when m.state='frozen' then 'Deactivated member' when m.state='deleted' then 'Deleted user' else p.display_name end display_name,
 case when m.state in ('frozen','deleted') then null else c.name end primary_club_name,
 null::text national_team_name,
 case when m.state in ('frozen','deleted') then null else w.name end generation_name,
 1::integer level,case when m.state in ('frozen','deleted') then null else coalesce(m.writer_status,'Supporter') end title_name,
 null::text selected_badge_name,p.registration_year,
 case when m.state in ('frozen','deleted') then null else m.seat_number end founding_seat
from public.user_profiles p left join public.community_memberships m on m.user_id=p.id
left join public.admission_waves w on w.id=m.wave_id left join public.clubs c on c.id=p.primary_club_id
where p.onboarding_completed
$$;

create or replace function community_private.username_available(candidate text) returns boolean language sql stable security definer set search_path='' as $$
 select lower(trim(candidate)) ~ '^[a-z0-9_]{3,24}$' and lower(trim(candidate)) !~ '^(deleted|pending)_' and not exists(select 1 from public.user_profiles where username=lower(trim(candidate)) and id is distinct from auth.uid())
$$;

-- Preserve review restrictions through appeals and reject incomplete decisions.
create or replace function community_private.move_content(p_kind text,p_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid; content_body text; content_status text; saved community_private.recycle_bin; tbl text;
begin
 if auth.uid() is null then raise exception 'sign in required'; end if;
 if p_kind is null or p_action is null or p_kind not in ('entry','comment') or p_action not in ('delete','restore','purge') then raise exception 'invalid action'; end if;
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
  if content_status<>'deleted' or exists(select 1 from public.content_reports where target_type=p_kind and target_id=p_id and status in ('actioned','appealed')) then raise exception 'This post is under review.'; end if;
  execute format('update public.%I set body=$2,status=''active'',deleted_at=null,deletion_origin=null where id=$1',tbl) using p_id,saved.body;
  delete from community_private.recycle_bin where kind=p_kind and target_id=p_id;
 else
  if content_status<>'deleted' then raise exception 'Delete the post before permanently erasing it.'; end if;
  if exists(select 1 from community_private.legal_holds where ((target_type=p_kind and target_id=p_id) or (target_type='account' and target_id=auth.uid())) and expires_at>now()) then raise exception 'This record is subject to a documented legal hold.'; end if;
  delete from community_private.recycle_bin where kind=p_kind and target_id=p_id;
  execute format('update public.%I set purged_at=now() where id=$1',tbl) using p_id;
 end if;
end $$;

-- Preserve review restrictions through appeals and reject incomplete decisions.
create or replace function community_private.resolve_report(p_id uuid,p_action text,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare r public.content_reports; owner_id uuid; t_id uuid;
begin
 if not community_private.is_staff() then raise exception 'permission denied' using errcode='42501'; end if;
 if p_action is null or p_reason is null or p_action not in ('hide','dismiss','restore') or length(trim(p_reason)) not between 10 and 2000 then raise exception 'Add a clear decision reason (10–2000 characters).'; end if;
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

-- Preserve review restrictions through appeals and reject incomplete decisions.
create or replace function community_private.appeal_report(p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_reason is null or auth.uid() is null or length(trim(p_reason)) not between 10 and 2000 then raise exception 'Describe your appeal (10–2000 characters).'; end if;
 update public.content_reports r set status='appealed',appeal=trim(p_reason) where id=p_id and resolved_at>now()-interval '180 days' and appeal is null and (reporter_id=auth.uid() or subject_user_id=auth.uid());
 if not found then raise exception 'This decision is not eligible for an appeal.'; end if;
end $$;
