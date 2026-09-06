import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers });
Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return reply(405, { error: "Method not allowed" });
  const token = request.headers.get("x-community-job-token");
  if (!token || token.length !== 72) return reply(401, { error: "Unauthorized" });
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply(503, { error: "Worker is not configured" });
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const verified = await admin.rpc("community_check_worker_token", { p_token: token });
  if (verified.error || verified.data !== true) return reply(401, { error: "Unauthorized" });
  const { data, error } = await admin.rpc("community_retention_cleanup");
  if (error) { console.error("Retention cleanup failed", error.code); return reply(500, { error: "Cleanup failed" }); }
  const userIds = Array.isArray(data) ? data.filter((id): id is string => typeof id === "string").slice(0, 100) : [];
  let completed = 0;
  let failed = 0;
  for (const id of userIds) {
    const deleted = await admin.auth.admin.deleteUser(id, true);
    if (deleted.error && deleted.error.status !== 404) { failed++; continue; }
    const recorded = await admin.rpc("community_auth_cleanup_done", { p_user: id });
    if (recorded.error) failed++; else completed++;
  }
  return reply(failed ? 500 : 200, { completed, failed });
});
