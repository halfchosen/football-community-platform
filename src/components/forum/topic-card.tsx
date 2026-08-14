"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContributionsStream } from "@/components/forum/contributions-stream";
import { ShareButton } from "@/components/forum/share-button";
import { SourceBadge } from "@/components/forum/source-badge";
import { TopicTypeTag } from "@/components/forum/topic-type-tag";
import { AuthorLink } from "@/components/profile/author-link";
import type { TopicContributionsPayload } from "@/domains/forum/discussion";
import type { TopicListItem } from "@/lib/db/queries/topics";
import { timeAgo } from "@/lib/utils/date";

type TopicCardProps = {
  topic: TopicListItem;
  /** Where the card links to; previews point into the preview hub. */
  href?: string;
  /** Preview cards can point their mock authors to the profile preview. */
  authorHref?: string;
  /** Engagement meta shown in collapsed and profile contexts. */
  ratingAverage?: number;
  ratingCount?: number;
  contributionCount?: number;
  interactionCount?: number;
  /** Feed cards open the complete post stream without leaving the feed. */
  inlineContributions?: boolean;
  /** Deep links can open one topic directly inside the shared feed. */
  initialExpanded?: boolean;
  /** Mock payload lets the development preview exercise the real inline UI. */
  previewContent?: TopicContributionsPayload;
};

export function TopicCard({
  topic,
  href,
  authorHref,
  ratingAverage,
  ratingCount,
  contributionCount,
  interactionCount,
  inlineContributions = false,
  initialExpanded = false,
  previewContent,
}: TopicCardProps) {
  const hasRating = typeof ratingCount === "number" && ratingCount > 0;
  const topicHref = href ?? `/?topic=${encodeURIComponent(topic.id)}`;
  const expanded = initialExpanded;
  const totalInteractions = interactionCount ?? contributionCount;
  const [content, setContent] =
    useState<TopicContributionsPayload | null>(previewContent ?? null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = `topic-contributions-${topic.id}`;

  const loadContributions = useCallback(async () => {
    if (loadingContent || content) {
      return;
    }

    setLoadingContent(true);
    setContentError(null);

    try {
      const response = await fetch(
        `/api/forum/${encodeURIComponent(topic.id)}/contributions`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Post request failed");
      }

      setContent((await response.json()) as TopicContributionsPayload);
    } catch (error) {
      console.error("Failed to load topic posts", error);
      setContentError("Posts couldn't load. Check your connection and try again.");
    } finally {
      setLoadingContent(false);
    }
  }, [content, loadingContent, topic.id]);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      void loadContributions();
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [expanded, loadContributions]);

  if (inlineContributions && expanded) {
    return (
      <div
        className="grid gap-3 motion-safe:animate-[discussion-panel-in_220ms_ease-out]"
        id={panelId}
        ref={panelRef}
      >
        {loadingContent && !content ? (
          <ContributionsSkeleton />
        ) : content ? (
          <ContributionsStream
            contributions={content.contributions}
            loggedOut={content.loggedOut}
            openingHeader={<TopicHeader topic={topic} />}
            openingTrailingAction={<ShareButton url={topicHref} />}
            participation={content.participation}
            previewMode={Boolean(previewContent)}
            previewProfileHref={previewContent ? authorHref : undefined}
            ratings={content.ratings}
            topicId={topic.id}
            variant="inline"
            viewer={content.viewer}
          />
        ) : (
          <div className="rounded-2xl border border-violet-300 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            <p>{contentError ?? "Posts couldn't load."}</p>
            <button
              className="mt-3 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
              onClick={() => void loadContributions()}
              type="button"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <article className="group rounded-2xl border border-violet-300/80 bg-white p-4 shadow-sm shadow-violet-900/[0.045] transition hover:border-violet-400 hover:shadow-md hover:shadow-violet-600/10 sm:p-5">
      <TopicLabels topic={topic} />

      <Link
        aria-label={`Open ${topic.title}`}
        className="group/title block outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        href={topicHref}
      >
        <TopicTitleAndBody topic={topic} />
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <AuthorLink
          className="font-semibold text-slate-600"
          displayName={topic.authorDisplayName}
          href={authorHref}
          username={topic.authorUsername}
        />
        <span className="text-slate-400" suppressHydrationWarning>
          · {timeAgo(topic.createdAt)}
        </span>
        {typeof totalInteractions === "number" ? (
          <Link
            aria-label={`Open interactions for ${topic.title}, ${totalInteractions} total posts and replies`}
            className="ml-auto inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 font-extrabold text-violet-700 outline-none transition hover:bg-violet-100 hover:text-violet-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            href={topicHref}
          >
            Interaction ({totalInteractions})
          </Link>
        ) : null}
        {topic.openingEntryId ? (
          <Link
            aria-label={
              hasRating
                ? `Opening post rating ${ratingAverage?.toFixed(1)} from ${ratingCount} ratings`
                : `Rate the opening post for ${topic.title}`
            }
            className="rounded-full bg-amber-50 px-2.5 py-1 font-bold text-slate-600 outline-none transition hover:bg-amber-100 hover:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
            href={topicHref}
          >
            <span aria-hidden className="text-amber-500">★</span>{" "}
            {hasRating ? (
              <>
                {ratingAverage?.toFixed(1)}
                <span className="font-medium text-slate-400"> ({ratingCount})</span>
              </>
            ) : (
              "Rate"
            )}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function TopicHeader({ topic }: { topic: TopicListItem }) {
  return (
    <div className="grid gap-2.5">
      <TopicLabels topic={topic} />
      <h3 className="text-[18px] font-extrabold leading-snug tracking-tight text-slate-900">
        {topic.title}
      </h3>
    </div>
  );
}

function TopicLabels({ topic }: { topic: TopicListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <TopicTypeTag type={topic.topicType} />
      {topic.clubName ? (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
          ⚽ {topic.clubName}
        </span>
      ) : null}
      <SourceBadge sourceUrl={topic.sourceUrl} />
    </div>
  );
}

function TopicTitleAndBody({ topic }: { topic: TopicListItem }) {
  return (
    <>
      <h3 className="mt-2.5 text-[17px] font-extrabold leading-snug tracking-tight text-slate-900 decoration-violet-400 decoration-2 underline-offset-4 transition group-hover/title:text-violet-700 group-hover/title:underline">
        {topic.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {topic.openingBody}
      </p>
    </>
  );
}

function ContributionsSkeleton() {
  return (
    <div aria-label="Loading posts" className="grid gap-3" role="status">
      <div className="h-40 animate-pulse rounded-2xl border border-violet-200 bg-white" />
      <div className="h-32 animate-pulse rounded-2xl border border-violet-200 bg-white" />
      <span className="sr-only">Loading posts…</span>
    </div>
  );
}
