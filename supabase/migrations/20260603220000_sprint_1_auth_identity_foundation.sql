create extension if not exists pgcrypto;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  iso_code text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  country_id uuid references public.countries(id) on delete restrict,
  tier integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  country_id uuid references public.countries(id) on delete restrict,
  league_id uuid references public.leagues(id) on delete restrict,
  tier integer,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  start_date date,
  end_date date,
  is_permanent boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.titles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  min_level integer not null check (min_level >= 1),
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  level_number integer unique not null check (level_number >= 1),
  min_xp integer not null check (min_xp >= 0),
  title_id uuid references public.titles(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  primary_club_id uuid references public.clubs(id) on delete restrict,
  preferred_language text not null default 'en',
  onboarding_completed boolean not null default false,
  is_18_plus_confirmed boolean not null default false,
  community_rules_accepted_at timestamptz,
  registration_year integer not null default extract(year from now())::integer,
  generation_id uuid references public.generations(id) on delete restrict,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  current_title_id uuid references public.titles(id) on delete restrict,
  reputation_score integer not null default 0 check (reputation_score >= 0),
  selected_badge_id uuid references public.badges(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_username_format check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  constraint user_profiles_onboarding_required_fields check (
    onboarding_completed = false
    or (
      primary_club_id is not null
      and is_18_plus_confirmed = true
      and community_rules_accepted_at is not null
    )
  )
);

create table if not exists public.user_private_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_notifications_enabled boolean not null default true,
  interface_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_supported_clubs (
  user_id uuid references auth.users(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  support_type text not null default 'secondary',
  created_at timestamptz not null default now(),
  primary key (user_id, club_id),
  constraint user_supported_clubs_support_type check (support_type = 'secondary')
);

create table if not exists public.user_badges (
  user_id uuid references auth.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  awarded_reason text,
  primary key (user_id, badge_id)
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  xp_amount integer not null check (xp_amount > 0),
  source_type text,
  source_id uuid,
  created_at timestamptz not null default now(),
  constraint xp_events_event_type check (
    event_type in (
      'create_entry',
      'create_topic',
      'receive_like',
      'create_quiz',
      'complete_quiz',
      'daily_activity'
    )
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clubs_set_updated_at
before update on public.clubs
for each row execute function public.set_updated_at();

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger user_private_settings_set_updated_at
before update on public.user_private_settings
for each row execute function public.set_updated_at();

create or replace function public.prevent_user_profile_protected_field_updates()
returns trigger
language plpgsql
as $$
begin
  if current_user <> 'service_role' and (
    new.registration_year is distinct from old.registration_year
    or new.generation_id is distinct from old.generation_id
    or new.level is distinct from old.level
    or new.xp is distinct from old.xp
    or new.current_title_id is distinct from old.current_title_id
    or new.reputation_score is distinct from old.reputation_score
    or new.selected_badge_id is distinct from old.selected_badge_id
  ) then
    raise exception 'protected profile fields cannot be changed by normal users';
  end if;

  return new;
end;
$$;

create trigger user_profiles_block_protected_updates
before update on public.user_profiles
for each row execute function public.prevent_user_profile_protected_field_updates();

create index if not exists leagues_country_id_idx on public.leagues(country_id);
create index if not exists clubs_country_id_idx on public.clubs(country_id);
create index if not exists clubs_league_id_idx on public.clubs(league_id);
create index if not exists clubs_active_idx on public.clubs(active);
create index if not exists user_profiles_primary_club_id_idx on public.user_profiles(primary_club_id);
create index if not exists user_profiles_generation_id_idx on public.user_profiles(generation_id);
create index if not exists user_profiles_current_title_id_idx on public.user_profiles(current_title_id);
create index if not exists user_supported_clubs_club_id_idx on public.user_supported_clubs(club_id);
create index if not exists user_badges_badge_id_idx on public.user_badges(badge_id);
create index if not exists xp_events_user_id_idx on public.xp_events(user_id);
create index if not exists xp_events_event_type_idx on public.xp_events(event_type);

alter table public.countries enable row level security;
alter table public.leagues enable row level security;
alter table public.clubs enable row level security;
alter table public.generations enable row level security;
alter table public.titles enable row level security;
alter table public.levels enable row level security;
alter table public.badges enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_private_settings enable row level security;
alter table public.user_supported_clubs enable row level security;
alter table public.user_badges enable row level security;
alter table public.xp_events enable row level security;

create policy "Reference data is publicly readable"
on public.countries for select
using (true);

create policy "Leagues are publicly readable"
on public.leagues for select
using (active = true);

create policy "Clubs are publicly readable"
on public.clubs for select
using (active = true);

create policy "Generations are publicly readable"
on public.generations for select
using (true);

create policy "Titles are publicly readable"
on public.titles for select
using (active = true);

create policy "Levels are publicly readable"
on public.levels for select
using (active = true);

create policy "Badges are publicly readable"
on public.badges for select
using (active = true);

create policy "Profiles are publicly readable"
on public.user_profiles for select
using (true);

create policy "Users can insert their own profile"
on public.user_profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own editable profile"
on public.user_profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read their own private settings"
on public.user_private_settings for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own private settings"
on public.user_private_settings for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own private settings"
on public.user_private_settings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Supported clubs are publicly readable"
on public.user_supported_clubs for select
using (true);

create policy "Users can add their own secondary clubs"
on public.user_supported_clubs for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove their own secondary clubs"
on public.user_supported_clubs for delete
to authenticated
using (auth.uid() = user_id);

create policy "User badges are publicly readable"
on public.user_badges for select
using (true);

create policy "Users can read their own XP events"
on public.xp_events for select
to authenticated
using (auth.uid() = user_id);
