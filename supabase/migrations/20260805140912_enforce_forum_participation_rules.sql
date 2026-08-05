-- Enforce forum participation rules in PostgreSQL so direct Data API writes
-- cannot bypass the application service layer.
--
-- The application still performs the same checks to return friendly errors.
-- These triggers are the authoritative final guard and also serialize the
-- rolling guest-comment counter to prevent concurrent requests exceeding it.

create or replace function public.enforce_forum_topic_club_permission()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  canonical_club_name text;
  has_club_relation boolean;
begin
  new.club_name := nullif(pg_catalog.btrim(new.club_name), '');

  if new.club_id is null and new.club_name is null then
    return new;
  end if;

  if new.club_id is not null then
    select c.name
    into canonical_club_name
    from public.clubs c
    where c.id = new.club_id;

    if canonical_club_name is null then
      raise exception using
        errcode = '23514',
        message = 'club topic references an unknown club';
    end if;

    -- Never trust a caller-provided display snapshot when a canonical club
    -- row is available.
    new.club_name := canonical_club_name;
  end if;

  select
    exists (
      select 1
      from public.user_profiles up
      left join public.clubs primary_club
        on primary_club.id = up.primary_club_id
      left join public.club_suggestions primary_suggestion
        on primary_suggestion.id = up.primary_club_suggestion_id
      where up.id = new.author_id
        and (
          (new.club_id is not null and up.primary_club_id = new.club_id)
          or (
            new.club_name is not null
            and (
              pg_catalog.lower(primary_club.name) = pg_catalog.lower(new.club_name)
              or pg_catalog.lower(primary_suggestion.suggested_name) =
                pg_catalog.lower(new.club_name)
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
      where usc.user_id = new.author_id
        and (
          (new.club_id is not null and usc.club_id = new.club_id)
          or (
            new.club_name is not null
            and (
              pg_catalog.lower(followed_club.name) = pg_catalog.lower(new.club_name)
              or pg_catalog.lower(followed_suggestion.suggested_name) =
                pg_catalog.lower(new.club_name)
            )
          )
        )
    )
  into has_club_relation;

  if not has_club_relation then
    raise exception using
      errcode = '42501',
      message = 'club topic permission denied';
  end if;

  return new;
end;
$$;

drop trigger if exists forum_topics_enforce_club_permission
  on public.forum_topics;
create trigger forum_topics_enforce_club_permission
before insert on public.forum_topics
for each row execute function public.enforce_forum_topic_club_permission();

-- The MVP supports one opening entry per topic and no free-standing follow-up
-- entries yet. Keep direct Data API inserts inside that product boundary.
create or replace function public.validate_forum_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  topic_author_id uuid;
begin
  select t.author_id
  into topic_author_id
  from public.forum_topics t
  where t.id = new.topic_id;

  if topic_author_id is null then
    raise exception using
      errcode = '23503',
      message = 'entry topic does not exist';
  end if;

  if not new.is_opening then
    raise exception using
      errcode = '23514',
      message = 'additional forum entries are not enabled';
  end if;

  if new.author_id <> topic_author_id then
    raise exception using
      errcode = '42501',
      message = 'opening entry author must match the topic author';
  end if;

  return new;
end;
$$;

drop trigger if exists forum_entries_validate on public.forum_entries;
create trigger forum_entries_validate
before insert on public.forum_entries
for each row execute function public.validate_forum_entry();

-- Preserve reply validation while adding topic/entry integrity and the
-- database-authoritative rolling guest limit.
create or replace function public.validate_forum_comment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  topic record;
  entry_topic_id uuid;
  parent record;
  has_club_relation boolean;
  recent_guest_comments integer;
begin
  select t.club_id, t.club_name
  into topic
  from public.forum_topics t
  where t.id = new.topic_id;

  if topic is null then
    raise exception using
      errcode = '23503',
      message = 'comment topic does not exist';
  end if;

  if new.entry_id is not null then
    select e.topic_id
    into entry_topic_id
    from public.forum_entries e
    where e.id = new.entry_id
      and e.status = 'active';

    if entry_topic_id is null or entry_topic_id <> new.topic_id then
      raise exception using
        errcode = '23514',
        message = 'comment entry must belong to the same topic';
    end if;
  end if;

  if new.parent_comment_id is not null then
    select c.topic_id, c.parent_comment_id, c.status
    into parent
    from public.forum_comments c
    where c.id = new.parent_comment_id;

    if parent is null or parent.status <> 'active' then
      raise exception using
        errcode = '23503',
        message = 'parent comment does not exist';
    end if;

    if parent.topic_id <> new.topic_id then
      raise exception using
        errcode = '23514',
        message = 'reply must belong to the same topic as its parent';
    end if;

    if parent.parent_comment_id is not null then
      raise exception using
        errcode = '23514',
        message = 'replies can only be one level deep';
    end if;
  end if;

  if tg_op = 'INSERT' and (topic.club_id is not null or topic.club_name is not null) then
    select
      exists (
        select 1
        from public.user_profiles up
        left join public.clubs primary_club
          on primary_club.id = up.primary_club_id
        left join public.club_suggestions primary_suggestion
          on primary_suggestion.id = up.primary_club_suggestion_id
        where up.id = new.author_id
          and (
            (topic.club_id is not null and up.primary_club_id = topic.club_id)
            or (
              topic.club_name is not null
              and (
                pg_catalog.lower(primary_club.name) = pg_catalog.lower(topic.club_name)
                or pg_catalog.lower(primary_suggestion.suggested_name) =
                  pg_catalog.lower(topic.club_name)
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
        where usc.user_id = new.author_id
          and (
            (topic.club_id is not null and usc.club_id = topic.club_id)
            or (
              topic.club_name is not null
              and (
                pg_catalog.lower(followed_club.name) = pg_catalog.lower(topic.club_name)
                or pg_catalog.lower(followed_suggestion.suggested_name) =
                  pg_catalog.lower(topic.club_name)
              )
            )
          )
      )
    into has_club_relation;

    if not has_club_relation then
      -- Serialize the rolling counter for this user/topic pair so two
      -- simultaneous inserts cannot both pass at the boundary.
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtext(new.topic_id::text),
        pg_catalog.hashtext(new.author_id::text)
      );

      select count(*)::integer
      into recent_guest_comments
      from public.forum_comments c
      where c.topic_id = new.topic_id
        and c.author_id = new.author_id
        and c.status = 'active'
        and c.created_at >= pg_catalog.now() - interval '24 hours';

      if recent_guest_comments >= 3 then
        raise exception using
          errcode = '23514',
          message = 'guest comment limit reached';
      end if;
    end if;
  end if;

  return new;
end;
$$;

notify pgrst, 'reload schema';
