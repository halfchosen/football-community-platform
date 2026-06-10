-- Sprint 1C: football identity change-rule foundation.
--
-- 1. Timestamps backing the FAN-club 24h edit window and the
--    "teams I like" 21-day cooldown.
-- 2. Allow completing onboarding with no FAN club ("I don't support any
--    club"): the original constraint required exactly one primary identity.
--
-- Idempotent: safe to run on projects that already applied it.

alter table public.user_profiles
  add column if not exists fan_club_selected_at timestamptz;

alter table public.user_profiles
  add column if not exists liked_clubs_updated_at timestamptz;

comment on column public.user_profiles.fan_club_selected_at is
  'When the FAN club was first chosen. Editable freely for 24h after this; locked afterwards (change-request flow comes later).';

comment on column public.user_profiles.liked_clubs_updated_at is
  'When the liked/followed clubs were last changed. Further changes are blocked for 21 days after this.';

-- Relax the onboarding completeness rule: a profile may complete onboarding
-- with no FAN club. At most one primary identity is still enforced (both here
-- and by user_profiles_primary_identity_exactly_one).
alter table public.user_profiles
  drop constraint if exists user_profiles_onboarding_required_fields;

alter table public.user_profiles
  add constraint user_profiles_onboarding_required_fields check (
    onboarding_completed = false
    or (
      ((primary_club_id is not null)::integer + (primary_club_suggestion_id is not null)::integer <= 1)
      and is_18_plus_confirmed = true
      and community_rules_accepted_at is not null
    )
  );

notify pgrst, 'reload schema';
