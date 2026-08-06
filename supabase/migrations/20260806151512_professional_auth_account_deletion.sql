-- Professional account deletion without erasing community conversations.
--
-- Supabase Auth soft deletion keeps the auth.users UUID so content foreign
-- keys remain valid. This migration atomically removes private/product data
-- and turns the public profile into a non-identifying tombstone before the
-- Edge Function soft-deletes the Auth user.

alter table public.user_profiles
  add column if not exists account_deleted_at timestamptz;

comment on column public.user_profiles.account_deleted_at is
  'Set when the owner deletes their account. Login and private data are removed while community content remains attributed to an anonymous tombstone.';

alter table public.user_profiles
  drop constraint if exists user_profiles_onboarding_required_fields;

alter table public.user_profiles
  add constraint user_profiles_onboarding_required_fields check (
    account_deleted_at is not null
    or onboarding_completed = false
    or (
      ((primary_club_id is not null)::integer + (primary_club_suggestion_id is not null)::integer <= 1)
      and is_18_plus_confirmed = true
      and community_rules_accepted_at is not null
    )
  );

create or replace function public.prevent_user_profile_protected_field_updates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user <> 'service_role' and (
    new.registration_year is distinct from old.registration_year
    or new.generation_id is distinct from old.generation_id
    or new.level is distinct from old.level
    or new.xp is distinct from old.xp
    or new.current_title_id is distinct from old.current_title_id
    or new.reputation_score is distinct from old.reputation_score
    or new.selected_badge_id is distinct from old.selected_badge_id
    or new.account_deleted_at is distinct from old.account_deleted_at
  ) then
    raise exception 'protected profile fields cannot be changed by normal users';
  end if;

  return new;
end;
$$;

create or replace function public.anonymize_deleted_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  if target_user_id is null then
    raise exception 'target user is required' using errcode = '22004';
  end if;

  update public.user_profiles
  set
    username = 'deleted_' || left(replace(target_user_id::text, '-', ''), 16),
    display_name = 'Deleted user',
    primary_club_id = null,
    primary_club_suggestion_id = null,
    national_team_id = null,
    national_team_suggestion_id = null,
    preferred_language = 'en',
    onboarding_completed = true,
    is_18_plus_confirmed = false,
    community_rules_accepted_at = null,
    generation_id = null,
    level = 1,
    xp = 0,
    current_title_id = null,
    reputation_score = 0,
    selected_badge_id = null,
    fan_club_selected_at = null,
    liked_clubs_updated_at = null,
    account_deleted_at = now()
  where id = target_user_id;

  delete from public.user_private_settings where user_id = target_user_id;
  delete from public.user_supported_clubs where user_id = target_user_id;
  delete from public.user_badges where user_id = target_user_id;
  delete from public.xp_events where user_id = target_user_id;
  delete from public.forum_ratings where user_id = target_user_id;
  delete from public.club_suggestions where user_id = target_user_id;
end;
$$;

revoke all on function public.anonymize_deleted_account(uuid) from public;
revoke all on function public.anonymize_deleted_account(uuid) from anon;
revoke all on function public.anonymize_deleted_account(uuid) from authenticated;
grant execute on function public.anonymize_deleted_account(uuid) to service_role;

notify pgrst, 'reload schema';
