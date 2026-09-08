import Link from "next/link";
import { MemberShell } from "@/components/community/member-shell";
import { ContentActions } from "@/components/community/content-actions";
import { StatusNotice, EmptyState } from "@/components/ui/status-notice";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
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
      description="Every take and reply you've written, yours to manage."
      active="/me/activity"
    >
      <nav
        className="mb-4 flex gap-0.5 border-b border-line"
        aria-label="Activity views"
      >
        {[
          [false, "Posts & replies"],
          [true, "Recently deleted"],
        ].map(([value, label]) => (
          <Link
            key={String(value)}
            href={value ? "/me/activity?view=deleted" : "/me/activity"}
            aria-current={deleted === value ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 pb-2.5 text-[13.5px] font-semibold transition-colors ${
              deleted === value
                ? "border-navy text-ink"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {deleted && (
        <div className="mb-4">
          <StatusNotice title="Deleted posts stay for 30 days" compact>
            Restoring a post doesn&apos;t give back a daily allowance, and a
            moderation decision can block restoration.
          </StatusNotice>
        </div>
      )}
      <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="p-4 sm:p-5">
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <Link
                  href={`/?topic=${item.topic_id}`}
                  className="text-[14.5px] font-bold text-ink transition-colors hover:text-navy"
                >
                  {item.topic_title}
                </Link>
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-4">
                  {item.kind === "comment"
                    ? "Reply"
                    : item.is_opening
                      ? "Opening post"
                      : "Post"}
                </span>
              </div>
              <p className="post-text whitespace-pre-wrap">{item.body}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <time className="text-[12px] text-ink-4">
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
          <EmptyState
            compact
            title={deleted ? "Nothing deleted" : "No takes yet"}
            action={deleted ? undefined : { href: "/", label: "Find a debate" }}
          >
            {deleted
              ? "Posts you delete will wait here for 30 days."
              : "Your first take belongs here. Pick a topic and jump in."}
          </EmptyState>
        )}
      </div>
      <div className="mt-4 flex justify-between text-[13px] font-semibold text-ink-2">
        {page > 0 ? (
          <Link
            className="inline-flex items-center gap-1 hover:text-navy"
            href={`/me/activity?view=${deleted ? "deleted" : "active"}&page=${page - 1}`}
          >
            <ChevronLeftIcon size={14} />
            Newer
          </Link>
        ) : (
          <span />
        )}
        {items.length === 30 && (
          <Link
            className="inline-flex items-center gap-1 hover:text-navy"
            href={`/me/activity?view=${deleted ? "deleted" : "active"}&page=${page + 1}`}
          >
            Older
            <ChevronRightIcon size={14} />
          </Link>
        )}
      </div>
    </MemberShell>
  );
}
