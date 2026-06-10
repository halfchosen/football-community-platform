-- Sprint 1B repair migration.
--
-- Fixes the runtime error:
--   "Could not find the table 'public.club_suggestions' in the schema cache"
-- which occurs when a Supabase project was provisioned from a partial version
-- of the Sprint 1 SQL that predates club_suggestions.
--
-- Everything here is idempotent: safe to run on projects that already have
-- the canonical Sprint 1 schema.

-- 1. The club suggestions table (waitlist for clubs missing from the catalog).
--    Kept separate from the clubs catalog: suggestions start as 'pending' and
--    never appear in club pickers until an admin approves/merges them.
create table if not exists public.club_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context text not null check (context in ('primary', 'secondary', 'national_team')),
  suggested_name text not null,
  country_id uuid references public.countries(id) on delete set null,
  league_id uuid references public.leagues(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'merged')),
  created_at timestamptz not null default now(),
  constraint club_suggestions_name_present check (length(trim(suggested_name)) >= 2)
);

create index if not exists club_suggestions_user_id_idx on public.club_suggestions(user_id);
create index if not exists club_suggestions_status_idx on public.club_suggestions(status);

alter table public.club_suggestions enable row level security;

drop policy if exists "Users can insert their own club suggestions" on public.club_suggestions;
create policy "Users can insert their own club suggestions"
on public.club_suggestions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own club suggestions" on public.club_suggestions;
create policy "Users can read their own club suggestions"
on public.club_suggestions for select
to authenticated
using (auth.uid() = user_id);

-- 2. Suggestion link columns that depend on the table (no-ops when present).
alter table public.user_profiles
  add column if not exists primary_club_suggestion_id uuid references public.club_suggestions(id) on delete set null;

alter table public.user_profiles
  add column if not exists national_team_suggestion_id uuid references public.club_suggestions(id) on delete set null;

alter table public.user_supported_clubs
  add column if not exists club_suggestion_id uuid references public.club_suggestions(id) on delete cascade;

-- 3. Recreate the public profile view so it matches the canonical definition
--    (older partial schemas may have a version without the suggestion joins).
drop view if exists public.public_profiles;
create view public.public_profiles as
select
  up.id,
  up.username,
  up.display_name,
  coalesce(pc.name, pcs.suggested_name) as primary_club_name,
  coalesce(nt.name, nts.suggested_name) as national_team_name,
  g.name as generation_name,
  up.level,
  t.name as title_name,
  b.name as selected_badge_name,
  up.registration_year
from public.user_profiles up
left join public.clubs pc on pc.id = up.primary_club_id
left join public.club_suggestions pcs on pcs.id = up.primary_club_suggestion_id
left join public.national_teams nt on nt.id = up.national_team_id
left join public.club_suggestions nts on nts.id = up.national_team_suggestion_id
left join public.generations g on g.id = up.generation_id
left join public.titles t on t.id = up.current_title_id
left join public.badges b on b.id = up.selected_badge_id
where up.onboarding_completed = true;

grant select on public.public_profiles to anon, authenticated;

-- 4. Username availability check for instant onboarding validation.
--    SECURITY DEFINER so it can see every row of user_profiles (RLS only lets
--    users read their own profile) while exposing nothing but a boolean.
create or replace function public.is_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.user_profiles
    where username = lower(trim(candidate))
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- 5. Ask PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';
