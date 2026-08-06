import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const jsonHeaders = { "Content-Type": "application/json" };

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const authorization = request.headers.get("Authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "").trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!accessToken || !supabaseUrl || !publishableKey || !serviceRoleKey) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(accessToken);

  if (userError || !user) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: anonymizeError } = await adminClient.rpc(
    "anonymize_deleted_account",
    { target_user_id: user.id },
  );

  if (anonymizeError) {
    console.error("Account anonymization failed", anonymizeError.code);
    return jsonResponse(500, { error: "Account deletion failed" });
  }

  const { error: signOutError } = await adminClient.auth.admin.signOut(
    accessToken,
    "global",
  );

  if (signOutError) {
    console.error("Session revocation failed", signOutError.code);
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
    true,
  );

  if (deleteError) {
    console.error("Auth soft deletion failed", deleteError.code);
    return jsonResponse(500, { error: "Account deletion failed" });
  }

  return jsonResponse(200, { success: true });
});
