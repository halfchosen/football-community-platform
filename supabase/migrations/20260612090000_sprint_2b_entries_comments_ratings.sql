-- Sprint 2B: opening entries, comments/replies, 0-10 ratings, club topics.
--
-- * Long user content moves from forum_topics.body into forum_entries; every
--   topic gets an opening entry (backfilled here).
-- * forum_comments supports one-level replies (enforced by trigger).
-- * forum_ratings: one 0-10 score per user per target; public aggregates via
--   the forum_rating_summaries view; individual rows visible to owners only.
-- * forum_topics gains an optional club association (club_id for catalog
--   clubs, club_name snapshot for display and fallback-catalog clubs).
--
-- Idempotent: safe to run more than once.

-- ---------------------------------------------------------------------------
-- 1. Club association on topics
-- ---------------------------------------------------------------------------

alter table public.forum_topics
  add column if not exists club_id uuid references public.clubs(id) on delete set null;

alter table public.forum_topics
  add column if not exists club_name text;

create index if not exists forum_topics_club_id_idx
  on public.forum_topics (club_id);

-- ---------------------------------------------------------------------------
-- 2. Entries
-- ---------------------------------------------------------------------------

create table if not exists public.forum_entries (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  is_opening boolean not null default false,
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forum_entries_body_length check (
    length(trim(body)) between 1 and 10000
  )
);

create unique index if not exists forum_entries_one_opening_per_topic
  on public.forum_entries (topic_id)
  where is_opening;

create index if not exists forum_entries_topic_id_idx
  on public.forum_entries (topic_id, created_at);

drop trigger if exists forum_entries_set_updated_at on public.forum_entries;
create trigger forum_entries_set_updated_at
before update on public.forum_entries
for each row execute function public.set_updated_at();

alter table public.forum_entries enable row level security;

drop policy if exists "Active forum entries are publicly readable" on public.forum_entries;
create policy "Active forum entries are publicly readable"
on public.forum_entries for select
using (status = 'active');

drop policy if exists "Onboarded members can create their own entries" on public.forum_entries;
create policy "Onboarded members can create their own entries"
on public.forum_entries for insert
to authenticated
with check (
  auth.uid() = author_id
  and status = 'active'
  and exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.onboarding_completed = true
  )
);

-- No update/delete policies for entries in Sprint 2B.

-- ---------------------------------------------------------------------------
-- 3. Move topic bodies into opening entries, then drop forum_topics.body
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'forum_topics'
      and column_name = 'body'
  ) then
    insert into public.forum_entries (topic_id, author_id, body, is_opening, created_at)
    select t.id, t.author_id, t.body, true, t.created_at
    from public.forum_topics t
    where not exists (
      select 1 from public.forum_entries e
      where e.topic_id = t.id and e.is_opening
    );

    drop view if exists public.forum_topics_with_author;
    alter table public.forum_topics drop column body;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Comments (one-level replies)
-- ---------------------------------------------------------------------------

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  entry_id uuid references public.forum_entries(id) on delete cascade,
  parent_comment_id uuid references public.forum_comments(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forum_comments_body_length check (
    length(trim(body)) between 1 and 2000
  )
);

create index if not exists forum_comments_topic_id_idx
  on public.forum_comments (topic_id, created_at);
create index if not exists forum_comments_parent_idx
  on public.forum_comments (parent_comment_id);
create index if not exists forum_comments_author_topic_idx
  on public.forum_comments (author_id, topic_id, created_at);

drop trigger if exists forum_comments_set_updated_at on public.forum_comments;
create trigger forum_comments_set_updated_at
before update on public.forum_comments
for each row execute function public.set_updated_at();

-- Replies stay one level deep and must belong to the parent's topic.
create or replace function public.validate_forum_comment()
returns trigger
language plpgsql
as $$
declare
  parent record;
begin
  if new.parent_comment_id is not null then
    select topic_id, parent_comment_id into parent
    from public.forum_comments
    where id = new.parent_comment_id;

    if parent is null then
      raise exception 'parent comment does not exist';
    end if;

    if parent.topic_id <> new.topic_id then
      raise exception 'reply must belong to the same topic as its parent';
    end if;

    if parent.parent_comment_id is not null then
      raise exception 'replies can only be one level deep';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists forum_comments_validate on public.forum_comments;
create trigger forum_comments_validate
before insert or update on public.forum_comments
for each row execute function public.validate_forum_comment();

alter table public.forum_comments enable row level security;

drop policy if exists "Active forum comments are publicly readable" on public.forum_comments;
create policy "Active forum comments are publicly readable"
on public.forum_comments for select
using (status = 'active');

drop policy if exists "Onboarded members can create their own comments" on public.forum_comments;
create policy "Onboarded members can create their own comments"
on public.forum_comments for insert
to authenticated
with check (
  auth.uid() = author_id
  and status = 'active'
  and exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.onboarding_completed = true
  )
);

drop policy if exists "Users can update their own comments" on public.forum_comments;
create policy "Users can update their own comments"
on public.forum_comments for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "Users can delete their own comments" on public.forum_comments;
create policy "Users can delete their own comments"
on public.forum_comments for delete
to authenticated
using (auth.uid() = author_id);

-- Comment listing view with the public author identity.
drop view if exists public.forum_comments_with_author;
create view public.forum_comments_with_author as
select
  c.id,
  c.topic_id,
  c.entry_id,
  c.parent_comment_id,
  c.body,
  c.status,
  c.created_at,
  pp.username as author_username,
  pp.display_name as author_display_name
from public.forum_comments c
join public.public_profiles pp on pp.id = c.author_id
where c.status = 'active';

grant select on public.forum_comments_with_author to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Ratings (0-10, one per user per target)
-- ---------------------------------------------------------------------------

create table if not exists public.forum_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('topic', 'entry', 'comment')),
  target_id uuid not null,
  score integer not null check (score >= 0 and score <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forum_ratings_unique_target unique (user_id, target_type, target_id)
);

create index if not exists forum_ratings_target_idx
  on public.forum_ratings (target_type, target_id);

drop trigger if exists forum_ratings_set_updated_at on public.forum_ratings;
create trigger forum_ratings_set_updated_at
before update on public.forum_ratings
for each row execute function public.set_updated_at();

alter table public.forum_ratings enable row level security;

-- Individual ratings are private to their owner; aggregates are public via
-- the forum_rating_summaries view below.
drop policy if exists "Users can read their own ratings" on public.forum_ratings;
create policy "Users can read their own ratings"
on public.forum_ratings for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Onboarded members can create their own ratings" on public.forum_ratings;
create policy "Onboarded members can create their own ratings"
on public.forum_ratings for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.onboarding_completed = true
  )
);

drop policy if exists "Users can update their own ratings" on public.forum_ratings;
create policy "Users can update their own ratings"
on public.forum_ratings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own ratings" on public.forum_ratings;
create policy "Users can delete their own ratings"
on public.forum_ratings for delete
to authenticated
using (auth.uid() = user_id);

drop view if exists public.forum_rating_summaries;
create view public.forum_rating_summaries as
select
  target_type,
  target_id,
  round(avg(score)::numeric, 1) as average_score,
  count(*)::integer as rating_count
from public.forum_ratings
group by target_type, target_id;

grant select on public.forum_rating_summaries to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Topic listing view with author + opening entry + club
-- ---------------------------------------------------------------------------

drop view if exists public.forum_topics_with_author;
create view public.forum_topics_with_author as
select
  t.id,
  t.topic_type,
  t.title,
  t.source_url,
  t.source_domain,
  t.source_title,
  t.club_id,
  t.club_name,
  t.created_at,
  oe.id as opening_entry_id,
  oe.body as opening_body,
  pp.username as author_username,
  pp.display_name as author_display_name,
  pp.primary_club_name as author_club_name,
  pp.title_name as author_title_name,
  pp.level as author_level
from public.forum_topics t
join public.public_profiles pp on pp.id = t.author_id
left join public.forum_entries oe
  on oe.topic_id = t.id and oe.is_opening and oe.status = 'active';

grant select on public.forum_topics_with_author to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Atomic topic + opening entry creation (RLS still applies: invoker)
-- ---------------------------------------------------------------------------

create or replace function public.create_forum_topic(
  p_topic_type text,
  p_title text,
  p_body text,
  p_source_url text,
  p_source_domain text,
  p_club_id uuid,
  p_club_name text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_topic_id uuid;
begin
  insert into public.forum_topics (
    author_id, topic_type, title, source_url, source_domain, club_id, club_name
  )
  values (
    auth.uid(), p_topic_type, p_title, p_source_url, p_source_domain, p_club_id, p_club_name
  )
  returning id into v_topic_id;

  insert into public.forum_entries (topic_id, author_id, body, is_opening)
  values (v_topic_id, auth.uid(), p_body, true);

  return v_topic_id;
end;
$$;

revoke all on function public.create_forum_topic(text, text, text, text, text, uuid, text) from public;
grant execute on function public.create_forum_topic(text, text, text, text, text, uuid, text) to authenticated;

notify pgrst, 'reload schema';
