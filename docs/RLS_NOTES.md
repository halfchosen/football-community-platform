# RLS and Public-Data Notes

> Historical foundation document. September 2026 community scope, schema and
> security overrides are authoritative in [Community blueprint](product/COMMUNITY_BLUEPRINT.md),
> [Database and security](product/DATABASE_AND_SECURITY.md) and
> [Operations](product/OPERATIONS.md). Check [release status](product/RELEASE_STATUS.md)
> before treating any setup or validation described below as current.

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
- account deletion timestamp

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

## Forum Reads and Writes

`forum_topics`, `forum_entries`, `forum_comments`, and `forum_ratings` all have
RLS enabled. Public readers can see topics and active entries/comments.
Individual rating rows are owner-readable only; public rating data comes from
the aggregate-only `forum_rating_summaries` view.

Topic, contribution, reply, and rating inserts require an authenticated user whose
profile has completed onboarding. Owner ids are checked against `auth.uid()`.
Reply updates/deletes and rating updates/deletes are owner-only. Topics and
entries are immutable in the current product phase.

Database triggers add business-rule enforcement beyond row ownership:

- club topics may only target the author's FAN club or a followed/liked club
- canonical club names are derived from the referenced club row
- an opening contribution must be owned by the topic author; authenticated,
  onboarded members may add later contributions
- every reply must reference a contribution in the same topic; nested replies
  are structurally unavailable
- outside participants are limited to three contributions/replies per club topic in
  a rolling 24-hour window; an advisory transaction lock closes concurrent
  insert races

`create_forum_topic` is a `SECURITY INVOKER` RPC, so table RLS still applies to
its atomic topic + opening-contribution inserts. Execute permission is granted only to
`authenticated`; `public` and `anon` are explicitly revoked by the
`restrict_forum_rpc_execute` migration.

## Public Projection Views

`public_profiles`, `forum_topics_with_author`, `forum_entries_with_author`, and
`forum_comments_with_author` expose only the public identity/content fields
listed in their SQL definitions. `forum_rating_summaries` exposes aggregates,
never individual rating rows. The topic, contribution, and reply projections
are `security_invoker` views over public/RLS-protected content tables and are
also security barriers. Their selected fields must be reviewed whenever a view
definition changes.

Supabase’s database advisor reports owner-executed public views as
`security_definer_view`. This remains an accepted, documented exception only
for `public_profiles` and `forum_rating_summaries`: changing either to
`security_invoker` without a separate public projection/aggregate store would
break anonymous reads or require broader grants on private base tables.

## Account Deletion

`public.anonymize_deleted_account(uuid)` is `SECURITY DEFINER` because it must
atomically scrub data across RLS-protected tables. It is not a public product
RPC: execute is revoked from `PUBLIC`, `anon`, and `authenticated`, granted only
to `service_role`, and the function independently verifies the request JWT role.
The Edge Function never accepts a target user ID and passes only the user ID
derived from the caller's verified JWT.
