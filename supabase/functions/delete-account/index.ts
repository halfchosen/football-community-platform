import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Retired endpoint: the account lifecycle now requires recent reauthentication,
// a versioned recovery choice, and the atomic community_account_lifecycle RPC.
Deno.serve(() => new Response(JSON.stringify({ error: "Use Account & privacy to manage account deletion." }), {
  status: 410,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
}));
