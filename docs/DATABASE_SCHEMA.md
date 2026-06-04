# Sprint 1 Database Schema

This schema is a foundation for authentication, onboarding, and visible football identity.

Authentication itself is handled by Supabase Auth in `auth.users`. Application profile data is stored in public tables linked to `auth.users`.

## Reference Tables

- `countries`
- `leagues`
- `clubs`
- `generations`
- `titles`
- `levels`
- `badges`

These tables support public reads. Sprint 1 seed data is intentionally representative rather than exhaustive.

## User-Owned Tables

- `user_profiles`
- `user_private_settings`
- `user_supported_clubs`
- `user_badges`
- `xp_events`

`user_profiles` stores public identity fields such as username, primary club, generation, level, title, XP, and selected badge placeholder. `user_private_settings` stores private preferences. `user_supported_clubs` stores optional secondary clubs.

## Gamification Scope

Sprint 1 creates only the data foundation:

- Level is numeric.
- Level 1 starts with the `Supporter` title.
- `Contributor` starts at Level 3.
- XP exists as a field.
- `xp_events` exists for future event recording.
- Automatic XP calculation is not implemented.

Badges are stored separately from generation, level, and title.
