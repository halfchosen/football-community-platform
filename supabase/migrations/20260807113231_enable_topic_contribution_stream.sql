-- Make the topic the primary object: the opening text and every later
-- top-level member post are forum_entries; forum_comments are direct,
-- one-level replies to a specific entry.

-- Views depending on the legacy parent_comment_id column must be removed
-- before the column can be retired.
drop view if exists public.forum_comments_with_author;

-- The previous product guard intentionally blocked non-opening entries.
-- Remove it while historical top-level comments are moved into entries.
drop trigger if exists forum_entries_validate on public.forum_entries;
drop trigger if exists forum_comments_validate on public.forum_comments;

-- Preserve ids and timestamps so links, ratings, authorship, and ordering do
-- not change. A former top-level comment becomes a peer contribution.
insert into public.forum_entries (
  id,
  topic_id,
  author_id,
  body,
  is_opening,
  status,
  created_at,
  updated_at
)
select
  c.id,
  c.topic_id,
  c.author_id,
  c.body,
  false,
  c.status,
  c.created_at,
  c.updated_at
from public.forum_comments c
where c.parent_comment_id is null
on conflict (id) do nothing;

-- Existing nested replies now point directly at the contribution created
-- from their former parent. Replies remain replies and keep their own ids.
update public.forum_comments c
set
  entry_id = c.parent_comment_id,
  parent_comment_id = null
where c.parent_comment_id is not null
  and exists (
    select 1
    from public.forum_entries e
    where e.id = c.parent_comment_id
      and not e.is_opening
  );

-- Ratings on migrated top-level content continue to target that same uuid,
-- but its canonical type is now entry.
update public.forum_ratings r
set target_type = 'entry'
where r.target_type = 'comment'
  and exists (
    select 1
    from public.forum_entries e
    where e.id = r.target_id
      and not e.is_opening
  );

-- Delete only the duplicated source rows after their content and descendants
-- have been safely moved.
delete from public.forum_comments c
where exists (
  select 1
  from public.forum_entries e
  where e.id = c.id
    and not e.is_opening
);

alter table public.forum_comments
  alter column entry_id set not null;

drop index if exists public.forum_comments_parent_idx;

alter table public.forum_comments
  drop column if exists parent_comment_id;

-- Shared helper used by both top-level contributions and their replies.
create or replace function public.user_has_forum_club_relation(
  p_user_id uuid,
  p_club_id uuid,
  p_club_name text
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.user_profiles up
      left join public.clubs primary_club
        on primary_club.id = up.primary_club_id
      left join public.club_suggestions primary_suggestion
        on primary_suggestion.id = up.primary_club_suggestion_id
      where up.id = p_user_id
        and (
          (p_club_id is not null and up.primary_club_id = p_club_id)
          or (
            p_club_name is not null
            and (
              pg_catalog.lower(primary_club.name) = pg_catalog.lower(p_club_name)
              or pg_catalog.lower(primary_suggestion.suggested_name) =
                pg_catalog.lower(p_club_name)
            )
          )
        )
    )
    or exists (
      select 1
      from public.user_supported_clubs usc
      left join public.clubs followed_club
        on followed_club.id = usc.club_id
      left join public.club_suggestions followed_suggestion
        on followed_suggestion.id = usc.club_suggestion_id
      where usc.user_id = p_user_id
        and (
          (p_club_id is not null and usc.club_id = p_club_id)
          or (
            p_club_name is not null
            and (
              pg_catalog.lower(followed_club.name) = pg_catalog.lower(p_club_name)
              or pg_catalog.lower(followed_suggestion.suggested_name) =
                pg_catalog.lower(p_club_name)
            )
          )
        )
    );
$$;

revoke all on function public.user_has_forum_club_relation(uuid, uuid, text)
  from public;
grant execute on function public.user_has_forum_club_relation(uuid, uuid, text)
  to authenticated;

-- One rolling budget covers both new contributions and replies on a club
-- topic. Fans/followers remain unlimited.
create or replace function public.count_recent_forum_participation(
  p_topic_id uuid,
  p_user_id uuid
)
returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select (
    (
      select count(*)
      from public.forum_entries e
      where e.topic_id = p_topic_id
        and e.author_id = p_user_id
        and not e.is_opening
        and e.status = 'active'
        and e.created_at >= pg_catalog.now() - interval '24 hours'
    )
    +
    (
      select count(*)
      from public.forum_comments c
      where c.topic_id = p_topic_id
        and c.author_id = p_user_id
        and c.status = 'active'
        and c.created_at >= pg_catalog.now() - interval '24 hours'
    )
  )::integer;
$$;

revoke all on function public.count_recent_forum_participation(uuid, uuid)
  from public;
grant execute on function public.count_recent_forum_participation(uuid, uuid)
  to authenticated;

create or replace function public.validate_forum_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  topic record;
  recent_participation integer;
begin
  select t.author_id, t.club_id, t.club_name
  into topic
  from public.forum_topics t
  where t.id = new.topic_id;

  if topic is null then
    raise exception using
      errcode = '23503',
      message = 'contribution topic does not exist';
  end if;

  if new.is_opening then
    if new.author_id <> topic.author_id then
      raise exception using
        errcode = '42501',
        message = 'opening contribution author must match the topic author';
    end if;

    return new;
  end if;

  if (topic.club_id is not null or topic.club_name is not null)
    and not public.user_has_forum_club_relation(
      new.author_id,
      topic.club_id,
      topic.club_name
    )
  then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtext(new.topic_id::text),
      pg_catalog.hashtext(new.author_id::text)
    );

    select public.count_recent_forum_participation(
      new.topic_id,
      new.author_id
    )
    into recent_participation;

    if recent_participation >= 3 then
      raise exception using
        errcode = '23514',
        message = 'guest contribution limit reached';
    end if;
  end if;

  return new;
end;
$$;

create trigger forum_entries_validate
before insert on public.forum_entries
for each row execute function public.validate_forum_entry();

create or replace function public.validate_forum_comment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  topic record;
  entry_topic_id uuid;
  recent_participation integer;
begin
  select t.club_id, t.club_name
  into topic
  from public.forum_topics t
  where t.id = new.topic_id;

  if topic is null then
    raise exception using
      errcode = '23503',
      message = 'reply topic does not exist';
  end if;

  select e.topic_id
  into entry_topic_id
  from public.forum_entries e
  where e.id = new.entry_id
    and e.status = 'active';

  if entry_topic_id is null or entry_topic_id <> new.topic_id then
    raise exception using
      errcode = '23514',
      message = 'reply contribution must belong to the same topic';
  end if;

  if tg_op = 'INSERT'
    and (topic.club_id is not null or topic.club_name is not null)
    and not public.user_has_forum_club_relation(
      new.author_id,
      topic.club_id,
      topic.club_name
    )
  then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtext(new.topic_id::text),
      pg_catalog.hashtext(new.author_id::text)
    );

    select public.count_recent_forum_participation(
      new.topic_id,
      new.author_id
    )
    into recent_participation;

    if recent_participation >= 3 then
      raise exception using
        errcode = '23514',
        message = 'guest contribution limit reached';
    end if;
  end if;

  return new;
end;
$$;

create trigger forum_comments_validate
before insert or update on public.forum_comments
for each row execute function public.validate_forum_comment();

-- Public projections used by the app. The content tables have RLS, so these
-- views run with the caller's privileges. public_profiles remains a narrow,
-- intentionally public identity projection.
create or replace view public.forum_entries_with_author
with (security_invoker = true, security_barrier = true)
as
select
  e.id,
  e.topic_id,
  e.body,
  e.is_opening,
  e.status,
  e.created_at,
  pp.username as author_username,
  pp.display_name as author_display_name,
  pp.primary_club_name as author_club_name,
  pp.title_name as author_title_name,
  pp.level as author_level
from public.forum_entries e
join public.public_profiles pp on pp.id = e.author_id
where e.status = 'active';

create view public.forum_comments_with_author
with (security_invoker = true, security_barrier = true)
as
select
  c.id,
  c.topic_id,
  c.entry_id,
  c.body,
  c.status,
  c.created_at,
  pp.username as author_username,
  pp.display_name as author_display_name
from public.forum_comments c
join public.public_profiles pp on pp.id = c.author_id
where c.status = 'active';

alter view public.forum_topics_with_author
  set (security_invoker = true, security_barrier = true);

grant select on public.forum_entries_with_author to anon, authenticated;
grant select on public.forum_comments_with_author to anon, authenticated;

comment on table public.forum_entries is
  'Opening and later top-level contributions to a topic.';
comment on table public.forum_comments is
  'Direct one-level replies to a forum contribution.';

notify pgrst, 'reload schema';
