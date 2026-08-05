import type { ReactNode } from "react";
import Link from "next/link";
import type { TopicListItem } from "@/lib/db/queries/topics";
import {
  isNewsLikeType,
  UNSOURCED_NEWS_WARNING,
} from "@/domains/forum/topics";
import { SourceBadge } from "@/components/forum/source-badge";
import { SourceCard } from "@/components/forum/source-card";
import { ShareButton } from "@/components/forum/share-button";
import { TopicTypeTag } from "@/components/forum/topic-type-tag";
import { ClubAvatar } from "@/components/onboarding/club-avatar";
import { timeAgo } from "@/components/forum/topic-card";

type TopicDetailProps = {
  topic: TopicListItem;
  /** Rating pill for the topic (header). */
  topicRating?: ReactNode;
  /** Rating pill for the opening entry (entry action row). */
  entryRating?: ReactNode;
  /** FAN / Following / Guest chip for club topics. */
  participationBadge?: ReactNode;
  /** Active comments+replies, shown in the entry action row. */
  commentCount?: number;
  /** Logged-out pages point to the login prompt instead of a missing composer. */
  commentHref?: string;
  /** Preview topics can point their mock author to the profile preview. */
  authorProfileHref?: string;
};

// Entry-stream header: title block, then the opening entry as the first
// "message" with a compact action row underneath. Comments continue the
// stream right below (rendered by CommentsSection).
export function TopicDetail({
  topic,
  topicRating,
  entryRating,
  participationBadge,
  commentCount,
  commentHref = "#composer",
  authorProfileHref,
}: TopicDetailProps) {
  const authorName = topic.authorDisplayName ?? topic.authorUsername;

  return (
    <article className="grid gap-4">
      {/* Title block */}
      <header className="grid gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <TopicTypeTag type={topic.topicType} />
          {topic.clubName ? (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              ⚽ {topic.clubName}
            </span>
          ) : null}
          <SourceBadge sourceUrl={topic.sourceUrl} topicType={topic.topicType} />
          {participationBadge}
        </div>
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[28px]">
          {topic.title}
        </h1>
        {topicRating ? <div>{topicRating}</div> : null}
      </header>

      {!topic.sourceUrl && isNewsLikeType(topic.topicType) ? (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-rose-700 ring-1 ring-rose-200">
          <span aria-hidden className="mt-px">⚠️</span>
          {UNSOURCED_NEWS_WARNING}
        </p>
      ) : null}

      {/* Opening entry as the first message */}
      <div className="rounded-2xl border border-violet-900/[0.07] bg-white p-4 shadow-sm shadow-violet-900/[0.03] sm:p-5">
        <div className="flex items-center gap-2.5">
          <Link
            aria-label={`Open ${authorName}'s profile`}
            className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            href={
              authorProfileHref ??
              `/u/${encodeURIComponent(topic.authorUsername)}`
            }
          >
            <ClubAvatar name={authorName} size="md" />
          </Link>
          <p className="min-w-0 flex-1 text-sm leading-tight">
            <Link
              className="font-bold text-slate-900 transition hover:text-violet-700"
              href={
                authorProfileHref ??
                `/u/${encodeURIComponent(topic.authorUsername)}`
              }
            >
              {authorName}
              <span className="font-medium text-slate-400">
                {" "}@{topic.authorUsername}
              </span>
            </Link>
            <span className="block text-xs text-slate-400">
              {topic.authorTitleName ? `${topic.authorTitleName} · ` : ""}
              {topic.authorClubName ? `${topic.authorClubName} · ` : ""}
              <span suppressHydrationWarning>{timeAgo(topic.createdAt)}</span>
            </span>
          </p>
        </div>

        <div className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">
          {topic.openingBody}
        </div>

        {topic.sourceUrl ? (
          <div className="mt-3">
            <SourceCard
              sourceDomain={topic.sourceDomain}
              sourceTitle={topic.sourceTitle}
              sourceUrl={topic.sourceUrl}
            />
          </div>
        ) : null}

        {/* Entry action row */}
        <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-2.5 text-slate-500">
          <a
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-bold transition hover:bg-violet-50 hover:text-violet-700"
            href={commentHref}
          >
            <span aria-hidden>💬</span>
            {typeof commentCount === "number" ? commentCount : "Comment"}
          </a>
          {entryRating}
          <ShareButton />
        </div>
      </div>
    </article>
  );
}
