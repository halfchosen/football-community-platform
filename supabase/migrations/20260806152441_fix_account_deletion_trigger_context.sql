-- SECURITY DEFINER account anonymization runs as the function owner
-- (`postgres`). Permit protected-field updates only when either the SQL role
-- is privileged or the verified PostgREST JWT role is `service_role`.

create or replace function public.prevent_user_profile_protected_field_updates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('service_role', 'postgres')
    and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
    and (
      new.registration_year is distinct from old.registration_year
      or new.generation_id is distinct from old.generation_id
      or new.level is distinct from old.level
      or new.xp is distinct from old.xp
      or new.current_title_id is distinct from old.current_title_id
      or new.reputation_score is distinct from old.reputation_score
      or new.selected_badge_id is distinct from old.selected_badge_id
      or new.account_deleted_at is distinct from old.account_deleted_at
    )
  then
    raise exception 'protected profile fields cannot be changed by normal users';
  end if;

  return new;
end;
$$;
