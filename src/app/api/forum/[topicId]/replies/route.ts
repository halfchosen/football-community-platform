import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { getRatingSummaries } from "@/lib/db/queries/forum";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;
  const query = new URL(request.url).searchParams;
  const entry = query.get("entry") ?? "";
  const raw = Number(query.get("offset"));
  const offset = Number.isFinite(raw)
    ? Math.max(0, Math.min(300000, Math.floor(raw)))
    : 0;
  if (
    ![entry, topicId].every((id) =>
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        id,
      ),
    )
  )
    return Response.json({ error: "Invalid post." }, { status: 400 });
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("forum_comments_with_author")
    .select("*", { count: "exact" })
    .eq("topic_id", topicId)
    .eq("entry_id", entry)
    .order("created_at")
    .order("id")
    .range(offset, offset + 19);
  if (error)
    return Response.json(
      { error: "Replies could not be loaded." },
      { status: 503 },
    );
  type Row = {
    id: string;
    body: string;
    created_at: string;
    author_username: string;
    author_display_name: string | null;
    reply_to_comment_id: string | null;
    reply_to_username: string | null;
    status: string;
  };
  const replies = ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    authorUsername: row.author_username,
    authorDisplayName: row.author_display_name,
    replyToCommentId: row.reply_to_comment_id,
    replyToUsername: row.reply_to_username,
    status: row.status,
  }));
  const user = await getAuthenticatedUser();
  const ratings = await getRatingSummaries(
    replies.map((row) => row.id),
    user?.id ?? null,
  );
  return Response.json(
    { replies, total: count ?? 0, ratings: Object.fromEntries(ratings) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
