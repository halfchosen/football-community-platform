# Sprint 1 Database Schema

This schema is a foundation for authentication, onboarding, and visible football identity.

Authentication itself is handled by Supabase Auth in `auth.users`. Application profile data is stored in public tables linked to `auth.users`.

## Catalog Tables

- `countries`
- `leagues`
- `clubs`
- `club_league_memberships`
- `national_teams`
- `generations`
- `titles`
- `levels`
- `badges`

`clubs` is canonical club identity. League membership is stored separately in `club_league_memberships` so seasonal movement does not rewrite club identity.

Sprint 1 seed data is a curated first-pass 2025-26 catalog and is intentionally admin-reviewable later.

## Suggestions

- `club_suggestions`

“Other / My club is not listed” values are stored here for admin review. They are not inserted into the canonical `clubs` or `national_teams` tables.

## User-Owned Tables

- `user_profiles`
- `user_private_settings`
- `user_supported_clubs`
- `user_badges`
- `xp_events`

`user_profiles` stores identity fields such as username, primary club or primary club suggestion, optional national team or suggestion, generation, level, title, XP, and selected badge placeholder.

`user_private_settings` stores private preferences. `user_supported_clubs` stores up to three optional secondary clubs or secondary club suggestions.

## Public Profile Shape

The app exposes safe public profile data through `public_profiles`, not direct full-table public reads on `user_profiles`.

Public fields:

- id
- username
- display_name
- primary_club_name
- national_team_name
- generation_name
- level
- title_name
- selected_badge_name
- registration_year

## Gamification Scope

Sprint 1 creates only the data foundation:

- Level is numeric.
- Level 1 starts with the `Supporter` title.
- `Contributor` starts at Level 3.
- XP exists as a field.
- `xp_events` exists for future event recording.
- Automatic XP calculation is not implemented.

Badges are stored separately from generation, level, and title.
