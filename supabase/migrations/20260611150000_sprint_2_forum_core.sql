-- Sprint 2: Forum Core — topics with the media/source policy.
--
-- Media policy (intentional):
--   * No user image uploads, no Supabase Storage logic, no rehosted media.
--   * Source representation is link-card only: URL + extracted domain
--     (+ optional safe page title). Full article text is never stored.
--
-- Idempotent: safe to run more than once.

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  topic_type text not null check (
    topic_type in (
      'general', 'transfer', 'rumor', 'news', 'official', 'match',
      'analysis', 'history', 'question', 'tactical', 'lineup_idea',
      'finance', 'injury', 'youth', 'nostalgia', 'other'
    )
  ),
  title text not null,
  body text not null,
  source_url text,
  source_domain text,
  source_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forum_topics_title_length check (
    length(trim(title)) between 8 and 140
  ),
  -- User commentary is always required (no bare-link topics).
  constraint forum_topics_body_length check (
    length(trim(body)) between 30 and 10000
  ),
  constraint forum_topics_source_url_format check (
    source_url is null or source_url ~* '^https?://'
  ),
  -- Domain is derived from the URL; never present without one.
  constraint forum_topics_source_domain_requires_url check (
    source_domain is null or source_url is not null
  )
);

create index if not exists forum_topics_created_at_idx
  on public.forum_topics (created_at desc);
create index if not exists forum_topics_topic_type_idx
  on public.forum_topics (topic_type);
create index if not exists forum_topics_author_id_idx
  on public.forum_topics (author_id);

drop trigger if exists forum_topics_set_updated_at on public.forum_topics;
create trigger forum_topics_set_updated_at
before update on public.forum_topics
for each row execute function public.set_updated_at();

alter table public.forum_topics enable row level security;

drop policy if exists "Forum topics are publicly readable" on public.forum_topics;
create policy "Forum topics are publicly readable"
on public.forum_topics for select
using (true);

-- Only onboarded members can create topics, and only as themselves.
drop policy if exists "Onboarded members can create their own topics" on public.forum_topics;
create policy "Onboarded members can create their own topics"
on public.forum_topics for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.onboarding_completed = true
  )
);

-- No update/delete policies in Sprint 2: topics are immutable for now.
-- Editing/moderation arrives in a later sprint.

-- Listing view that joins the public author identity (public_profiles only
-- exposes non-sensitive fields of onboarded users).
drop view if exists public.forum_topics_with_author;
create view public.forum_topics_with_author as
select
  t.id,
  t.topic_type,
  t.title,
  t.body,
  t.source_url,
  t.source_domain,
  t.source_title,
  t.created_at,
  pp.username as author_username,
  pp.display_name as author_display_name,
  pp.primary_club_name as author_club_name,
  pp.title_name as author_title_name,
  pp.level as author_level
from public.forum_topics t
join public.public_profiles pp on pp.id = t.author_id;

grant select on public.forum_topics_with_author to anon, authenticated;

notify pgrst, 'reload schema';
