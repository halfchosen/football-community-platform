import { getAuthenticatedUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user)
    return Response.json(
      { error: "Sign in to download your data." },
      { status: 401 },
    );
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("export_community_data");
  if (error)
    return Response.json(
      { error: "Your export could not be prepared. Please retry." },
      { status: 503 },
    );
  return Response.json(
    { ...data, account: { email: user.email, created_at: user.created_at } },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition":
          'attachment; filename="football-community-data.json"',
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
