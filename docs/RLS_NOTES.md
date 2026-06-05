# Sprint 1 RLS Notes

All public schema tables in the Sprint 1 migration have Row Level Security enabled.

## Public Reads

The following catalog data is public-readable because it is required for onboarding choices:

- countries
- leagues
- active clubs
- current club league memberships
- active national teams
- generations
- active titles
- active levels
- active badges
- user badges

Sensitive auth data remains in Supabase Auth and is not exposed by the app.

Full `user_profiles` rows are owner-readable only. Public profile display uses the `public_profiles` view, which exposes a limited safe field set.

## Owner Writes

Authenticated users can create and update their own profile row, own private settings, own club suggestions, and own secondary supported clubs.

`club_suggestions` is owner-readable by default and is not public-readable. Admin review workflows can be added later.

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

## Secondary Club Rules

Database triggers enforce:

- maximum three secondary clubs per user
- no primary canonical club as a secondary club
- canonical secondary club uniqueness
- suggestion secondary club uniqueness
- suggestion rows must belong to the same user

## Manual Dashboard Assumption

If Supabase Data API settings require explicit grants for newly created SQL tables, grant only the required `anon` and `authenticated` access after confirming RLS is enabled. RLS controls row visibility; grants control whether the Data API can access the table at all.
