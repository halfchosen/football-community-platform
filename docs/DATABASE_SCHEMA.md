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

`user_profiles.account_deleted_at` marks an anonymized account tombstone. A
deleted account keeps its UUID only to preserve forum referential integrity;
private/user-owned auxiliary data is removed and the public identity becomes
`Deleted user`.

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

## Sprint 1B Repair Migration

`supabase/migrations/20260610120000_sprint_1b_repair_club_suggestions.sql` repairs
projects provisioned from a partial Sprint 1 SQL run that lacked
`club_suggestions` (the cause of the runtime error
"Could not find the table 'public.club_suggestions' in the schema cache").

It is idempotent and:

- creates `club_suggestions` with its indexes and RLS policies if missing
- adds the suggestion link columns on `user_profiles` and
  `user_supported_clubs` if missing
- recreates the `public_profiles` view with the canonical definition
- adds `is_username_available(text)` (SECURITY DEFINER) used by the
  onboarding instant username check
- reloads the PostgREST schema cache

## One Club Per League

A user can support only one club per league (favorite + secondary combined):

- Client: club picker disables clubs from leagues already used.
- Server (schemas): submitted league keys are checked for duplicates.
- Server (service): for catalog clubs, leagues are re-derived from
  `club_league_memberships` so a tampered payload cannot bypass the rule.

## Sprint 1C: Identity Change Rules

`supabase/migrations/20260611090000_sprint_1c_identity_change_rules.sql` adds:

- `user_profiles.fan_club_selected_at` — when the FAN club was first chosen.
  The FAN club is freely editable for 24 hours after this, then locked
  (a change-request flow will come later).
- `user_profiles.liked_clubs_updated_at` — when "teams I like / follow" last
  changed. Further changes are blocked for 21 days.
- Relaxes `user_profiles_onboarding_required_fields` so onboarding can be
  completed with no FAN club ("I don't support any club"). Such users get no
  club-specific topic-creation privileges later until they pick a catalog club.

Terminology: the primary identity is labeled "My FAN club"; secondary
identities are "Teams I like / follow". Identities are catalog-only — free
text never becomes an active identity. "My club is not listed" files a
pending row in `club_suggestions` (status `pending`), which does not appear
in pickers and does not count as a FAN/LIKE club until approved/merged.

National team columns remain in the database but are not exposed anywhere in
the Sprint 1 UI; existing values are preserved (settings saves no longer
touch the national team columns).
