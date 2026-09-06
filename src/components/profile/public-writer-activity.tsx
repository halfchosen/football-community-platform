import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContentActions } from "@/components/community/content-actions";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { getProfileByUserId } from "@/lib/db/queries/profiles";
import { EmptyState } from "@/components/ui/status-notice";
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
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="t-section text-ink">Posts & replies</h2>
        {own?.username === username && (
          <Link
            href="/me/activity"
            className="text-[12.5px] font-semibold text-navy hover:underline"
          >
            Manage my activity
          </Link>
        )}
      </header>
      <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="p-4 sm:p-5">
              <Link
                href={`/?topic=${item.topic_id}#post-${item.id}`}
                className="text-[13.5px] font-bold text-navy hover:underline"
              >
                {names.get(item.topic_id) ?? "Community topic"}
              </Link>
              <p className="post-text mt-1.5 whitespace-pre-wrap break-words">
                {item.body.length > 500
                  ? `${item.body.slice(0, 500)}…`
                  : item.body}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[12px] text-ink-4">
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
          <EmptyState compact title="No public posts yet">
            When this supporter writes, it shows up here.
          </EmptyState>
        )}
      </div>
    </section>
  );
}
