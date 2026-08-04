-- Keep topic creation behind authenticated, onboarded user checks.
--
-- Supabase may grant newly created functions to API roles by default. The RPC
-- still enforces RLS, but removing anon EXECUTE closes the route before it can
-- reach those checks and matches the application contract.

revoke execute on function public.create_forum_topic(
  text, text, text, text, text, uuid, text
) from public, anon;

grant execute on function public.create_forum_topic(
  text, text, text, text, text, uuid, text
) to authenticated;

notify pgrst, 'reload schema';
