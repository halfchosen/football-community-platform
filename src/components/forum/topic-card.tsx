import Link from "next/link";
import type { TopicListItem } from "@/lib/db/queries/topics";
import { SourceBadge } from "@/components/forum/source-badge";
import { TopicTypeTag } from "@/components/forum/topic-type-tag";
import { AuthorLink } from "@/components/profile/author-link";

type TopicCardProps = {
  topic: TopicListItem;
  /** Where the card links to; previews point into the preview hub. */
  href?: string;
  /** Preview cards can point their mock authors to the profile preview. */
  authorHref?: string;
  /** Engagement meta shown in the action row when available. */
  ratingAverage?: number;
  ratingCount?: number;
  commentCount?: number;
};

// Feed entry card: airy and message-like, with a colourful category tag,
// bold title, excerpt, and a compact meta row. Not a heavy forum block.
export function TopicCard({
  topic,
  href,
  authorHref,
  ratingAverage,
  ratingCount,
  commentCount,
}: TopicCardProps) {
  const hasRating = typeof ratingCount === "number" && ratingCount > 0;
  const topicHref = href ?? `/forum/${topic.id}`;

  return (
    <article className="group rounded-2xl border border-violet-900/[0.07] bg-white p-4 shadow-sm shadow-violet-900/[0.03] transition hover:border-violet-300 hover:shadow-md hover:shadow-violet-600/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <TopicTypeTag type={topic.topicType} />
        {topic.clubName ? (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            ⚽ {topic.clubName}
          </span>
        ) : null}
        <SourceBadge sourceUrl={topic.sourceUrl} topicType={topic.topicType} />
      </div>

      <Link className="block outline-none" href={topicHref}>
        <h3 className="mt-2.5 text-[17px] font-extrabold leading-snug tracking-tight text-slate-900 transition group-hover:text-violet-700">
          {topic.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {topic.openingBody}
        </p>
      </Link>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <AuthorLink
          className="font-semibold text-slate-600"
          displayName={topic.authorDisplayName}
          href={authorHref}
          username={topic.authorUsername}
        />
        <span className="text-slate-400" suppressHydrationWarning>
          · {timeAgo(topic.createdAt)}
        </span>
        <Link
          aria-label={`Open ${topic.title}`}
          className="ml-auto inline-flex items-center gap-3 rounded-lg font-bold text-slate-500 outline-none transition hover:text-violet-700 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          href={topicHref}
        >
          {hasRating ? (
            <span>
              <span aria-hidden className="text-amber-500">★</span>{" "}
              {ratingAverage?.toFixed(1)}
              <span className="font-medium text-slate-400"> ({ratingCount})</span>
            </span>
          ) : null}
          {typeof commentCount === "number" ? (
            <span className="text-violet-600">💬 {commentCount}</span>
          ) : null}
        </Link>
      </div>
    </article>
  );
}

/** Instagram-style relative timestamp: 5m, 3h, 2d, then a short date. */
export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatTopicDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
