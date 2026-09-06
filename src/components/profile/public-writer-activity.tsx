import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContentActions } from "@/components/community/content-actions";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { getProfileByUserId } from "@/lib/db/queries/profiles";
export async function PublicWriterActivity({ username }: { username: string }) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser();
  const own = user ? await getProfileByUserId(user.id) : null;
  const [posts, replies] = await Promise.all([
    supabase
      .from("forum_entries_with_author")
      .select("id,topic_id,body,created_at")
      .eq("author_username", username)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("forum_comments_with_author")
      .select("id,topic_id,body,created_at")
      .eq("author_username", username)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  if (posts.error || replies.error)
    throw new Error("This writer's activity could not be loaded.");
  type Row = { id: string; topic_id: string; body: string; created_at: string };
  const items = [
    ...((posts.data ?? []) as Row[]).map((row) => ({
      ...row,
      kind: "entry" as const,
    })),
    ...((replies.data ?? []) as Row[]).map((row) => ({
      ...row,
      kind: "comment" as const,
    })),
  ]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 30);
  const ids = [...new Set(items.map((item) => item.topic_id))];
  const { data: topics } = ids.length
    ? await supabase.from("forum_topics").select("id,title").in("id", ids)
    : { data: [] };
  const names = new Map(
    ((topics ?? []) as { id: string; title: string }[]).map((topic) => [
      topic.id,
      topic.title,
    ]),
  );
  return (
    <section>
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Posts & replies</h2>
        {own?.username === username && (
          <Link href="/me/activity" className="text-xs font-bold text-navy">
            Manage my activity →
          </Link>
        )}
      </header>
      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="p-5">
              <Link
                href={`/?topic=${item.topic_id}#post-${item.id}`}
                className="text-sm font-bold text-navy"
              >
                {names.get(item.topic_id) ?? "Community topic"}
              </Link>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                {item.body.length > 500
                  ? `${item.body.slice(0, 500)}…`
                  : item.body}
              </p>
              <div className="mt-3 flex justify-between">
                <span className="text-xs text-slate-400">
                  {item.kind === "comment" ? "Reply" : "Post"} ·{" "}
                  {new Date(item.created_at).toLocaleDateString("en-GB")}
                </span>
                {user && (
                  <ContentActions
                    id={item.id}
                    kind={item.kind}
                    owned={own?.username === username}
                  />
                )}
              </div>
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No public posts yet.
          </p>
        )}
      </div>
    </section>
  );
}
