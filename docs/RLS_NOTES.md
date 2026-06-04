# Sprint 1 RLS Notes

All public schema tables in the Sprint 1 migration have Row Level Security enabled.

## Public Reads

The following data is public-readable because it is required for public profile display and onboarding choices:

- countries
- leagues
- active clubs
- generations
- active titles
- active levels
- active badges
- user profiles
- user supported clubs
- user badges

Sensitive auth data remains in Supabase Auth and is not exposed by the app.

## Owner Writes

Authenticated users can create and update their own profile row, own private settings, and own secondary supported clubs.

## Protected Fields

Normal users must not change:

- registration year
- generation
- level
- XP
- title
- reputation
- selected badge

The migration uses row-level policies plus a database trigger on `user_profiles` to block normal-user changes to those protected columns. Application server actions also validate and write only editable fields.

## Manual Dashboard Assumption

If Supabase Data API settings require explicit grants for newly created SQL tables, grant only the required `anon` and `authenticated` access after confirming RLS is enabled. RLS controls row visibility; grants control whether the Data API can access the table at all.
