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

## Username Availability Function (Sprint 1B)

`public.is_username_available(candidate text)` is SECURITY DEFINER so the
onboarding form can check usernames across all profiles even though
`user_profiles` RLS only exposes a user's own row. It returns a single
boolean and never exposes row data. Execute is granted to `anon` and
`authenticated`; all other privileges are revoked.

## Identity Change-Rule Timestamps (Sprint 1C)

`fan_club_selected_at` and `liked_clubs_updated_at` are written by the
application server actions running as the authenticated user, so they are not
in the protected-columns trigger. The 24h FAN lock and 21-day liked-clubs
cooldown are enforced in the application layer (service + UI); a database
trigger can harden this later if needed.
