-- Security and query-planning hardening found during the live pre-release
-- database audit. These changes do not alter product data or business rules.

-- Trigger functions should not inherit a caller-controlled search path.
alter function public.set_updated_at() set search_path = '';
alter function public.prevent_user_profile_protected_field_updates()
  set search_path = '';
alter function public.validate_profile_identity_suggestions()
  set search_path = '';
alter function public.validate_secondary_club_identity()
  set search_path = '';
alter function public.validate_forum_comment() set search_path = '';

-- Cover foreign keys used by forum joins and cascade checks.
create index if not exists forum_comments_entry_id_idx
  on public.forum_comments (entry_id);
create index if not exists forum_entries_author_id_idx
  on public.forum_entries (author_id);

-- Public-facing views intentionally expose constrained projections and
-- aggregates. A security barrier prevents caller predicates from being pushed
-- through those view boundaries in unsafe ways.
alter view public.public_profiles set (security_barrier = true);
alter view public.forum_comments_with_author set (security_barrier = true);
alter view public.forum_rating_summaries set (security_barrier = true);
alter view public.forum_topics_with_author set (security_barrier = true);

notify pgrst, 'reload schema';
