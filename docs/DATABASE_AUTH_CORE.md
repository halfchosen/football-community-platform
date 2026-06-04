# Database Design - Auth and User Core

## Purpose

This document describes the first database layer for authentication, onboarding, football identity, and future community features.

Supabase Auth handles actual authentication users.

Application-specific user data should be stored in public tables linked to `auth.users`.

## Tables

### countries

Fields:
- id uuid primary key
- name text not null
- iso_code text unique
- created_at timestamptz default now()

### leagues

Fields:
- id uuid primary key
- name text not null
- slug text unique not null
- country_id uuid references countries(id)
- tier integer
- active boolean default true
- created_at timestamptz default now()

### clubs

Fields:
- id uuid primary key
- name text not null
- slug text unique not null
- country_id uuid references countries(id)
- league_id uuid references leagues(id)
- tier integer
- logo_url text nullable
- active boolean default true
- created_at timestamptz default now()
- updated_at timestamptz default now()

### generations

Fields:
- id uuid primary key
- name text not null
- slug text unique not null
- description text nullable
- start_date date nullable
- end_date date nullable
- is_permanent boolean default true
- created_at timestamptz default now()

Examples:
- First Generation Writer
- Second Generation Writer
- Beta Member
- Founding Member

### titles

Fields:
- id uuid primary key
- name text not null
- slug text unique not null
- min_level integer not null
- sort_order integer not null
- active boolean default true
- created_at timestamptz default now()

Initial:
- Supporter
- New Writer
- Contributor
- Writer
- Active Writer
- Senior Writer
- Lead Writer
- Community Leader
- Club Voice
- Club Legend

### levels

Fields:
- id uuid primary key
- level_number integer unique not null
- min_xp integer not null
- title_id uuid references titles(id)
- active boolean default true
- created_at timestamptz default now()

Initial:
- Level 1: 0 XP
- Level 2: 50 XP
- Level 3: 150 XP
- Level 4: 300 XP
- Level 5: 600 XP
- Level 6: 1000 XP
- Level 7: 1600 XP
- Level 8: 2500 XP
- Level 9: 4000 XP
- Level 10: 7000 XP

### badges

Fields:
- id uuid primary key
- name text not null
- slug text unique not null
- description text nullable
- icon text nullable
- active boolean default true
- created_at timestamptz default now()

Initial examples:
- First Generation Writer
- First Entry
- First Topic
- First Quiz
- Early Member

For the first phase, only create the structure.

### user_profiles

Stores public and semi-public profile data.

Fields:
- id uuid primary key references auth.users(id)
- username text unique not null
- display_name text nullable
- primary_club_id uuid references clubs(id)
- preferred_language text default 'en'
- onboarding_completed boolean default false
- is_18_plus_confirmed boolean default false
- community_rules_accepted_at timestamptz nullable
- registration_year integer not null
- generation_id uuid references generations(id)
- level integer default 1
- xp integer default 0
- current_title_id uuid references titles(id)
- reputation_score integer default 0
- selected_badge_id uuid references badges(id)
- created_at timestamptz default now()
- updated_at timestamptz default now()

Rules:
- users can read public profile fields
- users can update only their own editable fields
- users cannot update level, xp, reputation, generation, or title directly

### user_private_settings

Fields:
- user_id uuid primary key references auth.users(id)
- email_notifications_enabled boolean default true
- interface_language text default 'en'
- created_at timestamptz default now()
- updated_at timestamptz default now()

Rules:
- only owner can read/update

### user_supported_clubs

Stores secondary supported clubs.

Fields:
- user_id uuid references auth.users(id)
- club_id uuid references clubs(id)
- support_type text not null default 'secondary'
- created_at timestamptz default now()

Primary key:
- user_id, club_id

Rules:
- user can read public supported clubs
- user can manage only their own secondary clubs
- primary club should be updated through user_profiles.primary_club_id

### user_badges

Fields:
- user_id uuid references auth.users(id)
- badge_id uuid references badges(id)
- awarded_at timestamptz default now()
- awarded_reason text nullable

Primary key:
- user_id, badge_id

### xp_events

For future XP tracking.

Fields:
- id uuid primary key
- user_id uuid references auth.users(id)
- event_type text not null
- xp_amount integer not null
- source_type text nullable
- source_id uuid nullable
- created_at timestamptz default now()

For this phase:
- create table structure only
- do not implement XP automation yet

## RLS Direction

Enable RLS on:
- user_profiles
- user_private_settings
- user_supported_clubs
- user_badges
- xp_events

Public readable:
- countries
- leagues
- clubs
- generations
- titles
- levels
- badges
- public profile fields

Owner editable:
- own username
- own display name
- own primary club
- own secondary clubs
- own preferred language
- own private settings

System/admin only:
- generation_id
- current_title_id
- level
- xp
- reputation_score
- badges
- xp_events

## Important

Do not rely only on frontend validation.
Use database constraints and RLS for important ownership and access rules.
