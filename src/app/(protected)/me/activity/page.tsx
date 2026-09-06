import Link from "next/link";
import { MemberShell } from "@/components/community/member-shell";
import { ContentActions } from "@/components/community/content-actions";
import { requireUser } from "@/lib/auth/guards";
import { getOwnActivity } from "@/lib/community/queries";
export const metadata = { title: "My activity" };
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const deleted = params.view === "deleted";
  const page = Math.max(
    0,
    Math.min(3333, Math.floor(Number(params.page) || 0)),
  );
  const items = await getOwnActivity(deleted, page * 30);
  return (
    <MemberShell
      title="My activity"
      description="Every take and reply, all in one place. Your words are yours to manage."
      active="/me/activity"
    >
      <nav className="mb-5 flex gap-2" aria-label="Activity views">
        {[
          [false, "Posts & replies"],
          [true, "Recently deleted"],
        ].map(([value, label]) => (
          <Link
            key={String(value)}
            href={value ? "/me/activity?view=deleted" : "/me/activity"}
            className={`rounded-full px-4 py-2 text-sm font-bold ${deleted === value ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {deleted && (
        <p className="mb-5 rounded-xl border border-mint bg-accent-soft p-4 text-sm leading-6 text-navy-strong">
          Deleted posts stay here for 30 days. Restoring a post does not reset
          your daily allowance. A moderation decision may prevent restoration.
        </p>
      )}
      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <Link
                  href={`/?topic=${item.topic_id}`}
                  className="font-bold text-slate-950 hover:text-navy"
                >
                  {item.topic_title}
                </Link>
                <span className="shrink-0 text-xs text-slate-400">
                  {item.kind === "comment"
                    ? "Reply"
                    : item.is_opening
                      ? "Opening post"
                      : "Post"}
                </span>
              </div>
              <p className="post-text whitespace-pre-wrap text-slate-600">
                {item.body}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <time className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleDateString("en-GB")}
                  {item.deleted_at
                    ? ` · Recover before ${new Date(new Date(item.deleted_at).getTime() + 30 * 86400000).toLocaleDateString("en-GB")}`
                    : ""}
                  {item.status === "hidden" ? " · Under review" : ""}
                </time>
                <ContentActions
                  id={item.id}
                  kind={item.kind}
                  owned
                  deleted={deleted}
                />
              </div>
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            {deleted
              ? "No recently deleted posts."
              : "Your first take belongs here. Pick a topic and jump in."}
          </p>
        )}
      </div>
      <div className="mt-4 flex justify-between text-sm font-bold">
        {page > 0 ? (
          <Link
            href={`/me/activity?view=${deleted ? "deleted" : "active"}&page=${page - 1}`}
          >
            ← Newer
          </Link>
        ) : (
          <span />
        )}
        {items.length === 30 && (
          <Link
            href={`/me/activity?view=${deleted ? "deleted" : "active"}&page=${page + 1}`}
          >
            Older →
          </Link>
        )}
      </div>
    </MemberShell>
  );
}
