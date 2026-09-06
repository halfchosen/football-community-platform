-- Narrow, explicitly granted private projections; public views respect caller privileges.
create function community_private.public_profiles() returns table(
 id uuid,username text,display_name text,primary_club_name text,national_team_name text,
 generation_name text,level integer,title_name text,selected_badge_name text,registration_year integer,founding_seat integer
) language sql stable security definer set search_path='' as $$
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
where p.onboarding_completed
$$;
create or replace view public.public_profiles with(security_invoker=true,security_barrier=true) as select * from community_private.public_profiles();
create function community_private.rating_summaries() returns table(target_type text,target_id uuid,average_score numeric,rating_count integer)
language sql stable security definer set search_path='' as $$
select r.target_type,r.target_id,round(avg(r.score)::numeric,1) average_score,count(*)::integer rating_count
from public.forum_ratings r where community_private.is_active(r.user_id) and (
(r.target_type='entry' and exists(select 1 from public.forum_entries e where e.id=r.target_id and e.status='active' and exists(select 1 from public.forum_topics t where t.id=e.topic_id and t.status='active'))) or
(r.target_type='comment' and exists(select 1 from public.forum_comments c where c.id=r.target_id and c.status='active' and exists(select 1 from public.forum_entries parent join public.forum_topics t on t.id=parent.topic_id where parent.id=c.entry_id and parent.status='active' and t.status='active'))) or
(r.target_type='topic' and exists(select 1 from public.forum_topics t where t.id=r.target_id and t.status='active')))
group by r.target_type,r.target_id
$$;
create or replace view public.forum_rating_summaries with(security_invoker=true,security_barrier=true) as select * from community_private.rating_summaries();
revoke all on function community_private.public_profiles(),community_private.rating_summaries() from public;
grant execute on function community_private.public_profiles(),community_private.rating_summaries() to anon,authenticated;

-- Trigger functions are never user-callable RPC endpoints.
revoke execute on function public.enforce_forum_topic_club_permission(),public.validate_forum_entry(),public.validate_forum_comment() from public,anon,authenticated;
create function community_private.username_available(candidate text) returns boolean language sql stable security definer set search_path='' as $$
 select lower(trim(candidate)) ~ '^[a-z0-9_]{3,24}$' and not exists(select 1 from public.user_profiles where username=lower(trim(candidate)) and id is distinct from auth.uid())
$$;
create or replace function public.is_username_available(candidate text) returns boolean language sql stable security invoker set search_path='' as $$ select community_private.username_available(candidate) $$;
revoke all on function community_private.username_available(text) from public;
grant execute on function community_private.username_available(text) to anon,authenticated;
notify pgrst,'reload schema';
