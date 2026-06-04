# Codex Task Sequence - Auth Core

## Task 0 - Planning

Read:
- AGENTS.md
- docs/AUTH_ONBOARDING_SCOPE.md
- docs/DATABASE_AUTH_CORE.md
- docs/GAMIFICATION_SIMPLE.md
- docs/ROUTES_AUTH_CORE.md
- docs/SUPABASE_SETUP.md

Create an implementation plan for the auth and onboarding foundation.

Do not code yet.

Return:
- recommended file structure
- database migration plan
- route plan
- component plan
- risks
- open questions

## Task 1 - Project Setup

Create or adjust a Next.js + TypeScript project structure with:
- Tailwind
- shadcn/ui-ready structure
- Supabase client setup
- environment variable examples
- basic layout

Do not implement business features yet.

## Task 2 - Database Migration

Create Supabase SQL migration for:
- countries
- leagues
- clubs
- generations
- titles
- levels
- badges
- user_profiles
- user_private_settings
- user_supported_clubs
- user_badges
- xp_events

Include:
- constraints
- indexes
- timestamps
- RLS enabled
- initial RLS policies
- seed data placeholders

## Task 3 - Supabase Auth Integration

Implement:
- Google login
- email/password signup
- email confirmation support
- login
- logout
- password reset
- update password

Add clean error handling.

## Task 4 - Onboarding Gate

Implement:
- onboarding check after login
- redirect incomplete users to `/onboarding`
- prevent incomplete users from accessing `/app`
- save onboarding fields to database

Fields:
- username
- 18+ confirmation
- primary club
- secondary clubs
- preferred language
- community rules acceptance

## Task 5 - Public User Profile

Implement:
- `/u/[username]`
- public profile card
- primary club display
- generation badge display
- title display
- level display
- selected badge placeholder
- placeholder stats

Do not implement real forum stats yet.

## Task 6 - Profile Settings

Implement:
- edit username if allowed
- edit display name
- edit primary club
- edit secondary clubs
- edit preferred language

Do not allow user to edit:
- generation
- XP
- level
- reputation
- title

## Task 7 - Verification

Run:
- typecheck
- lint
- build

Then summarize:
- what was implemented
- what was skipped
- remaining risks
- next recommended task
