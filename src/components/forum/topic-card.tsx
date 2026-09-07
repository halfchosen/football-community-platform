"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContributionsStream } from "@/components/forum/contributions-stream";
import { PostPagination } from "./post-pagination";
import { SaveTopicButton } from "@/components/community/content-actions";
import { ShareButton } from "@/components/forum/share-button";
import { SourceBadge } from "@/components/forum/source-badge";
import { TopicTypeTag } from "@/components/forum/topic-type-tag";
import { AuthorLink } from "@/components/profile/author-link";
import { Button } from "@/components/ui/button";
import { ReplyIcon, StarIcon } from "@/components/ui/icons";
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
  const [content, setContent] = useState<TopicContributionsPayload | null>(
    previewContent ?? null,
  );
  const [contentError, setContentError] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(
    expanded && !previewContent,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = `topic-contributions-${topic.id}`;

  const [page, setPage] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const loadContributions = useCallback(
    async (target: number | "last" = page) => {
      if (previewContent) return;
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const response = await fetch(
          `/api/forum/${encodeURIComponent(topic.id)}/contributions?page=${target}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Posts unavailable");
        const payload = (await response.json()) as TopicContributionsPayload;
        if (controller.signal.aborted) return;
        setContentError(null);
        setContent(payload);
        if (payload.page !== undefined) setPage(payload.page);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Posts unavailable", error);
          setContentError(
            "Posts couldn't load. Check your connection and try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoadingContent(false);
      }
    },
    [page, previewContent, topic.id],
  );
  useEffect(() => {
    if (!expanded || previewContent) return;
    const initialFrame = requestAnimationFrame(() => void loadContributions());
    const refresh = () => {
      if (document.visibilityState === "visible") void loadContributions();
    };
    const timer = setInterval(refresh, 20000);
    window.addEventListener("community:content-changed", refresh);
    return () => {
      cancelAnimationFrame(initialFrame);
      clearInterval(timer);
      requestRef.current?.abort();
      window.removeEventListener("community:content-changed", refresh);
    };
  }, [expanded, previewContent, loadContributions]);

  if (inlineContributions && expanded) {
    return (
      <div
        className="grid scroll-mt-20 gap-3 motion-safe:animate-[discussion-panel-in_220ms_ease-out]"
        id={panelId}
        ref={panelRef}
      >
        {loadingContent && !content ? (
          <ContributionsSkeleton />
        ) : content ? (
          <div className="grid gap-3">
            <ContributionsStream
              key={`${topic.id}:${content.quotaDay ?? "preview"}`}
              onContributionAdded={() => {
                if (!previewContent) void loadContributions("last");
              }}
              contributions={content.contributions}
              loggedOut={content.loggedOut}
              openingHeader={<TopicHeader topic={topic} />}
              openingTrailingAction={
                <span className="flex items-center gap-1">
                  {!content.loggedOut && (
                    <SaveTopicButton
                      topicId={topic.id}
                      preview={Boolean(previewContent)}
                      initialSaved={content.saved}
                    />
                  )}
                  <ShareButton url={topicHref} />
                </span>
              }
              participation={content.participation}
              previewMode={Boolean(previewContent)}
              previewProfileHref={previewContent ? authorHref : undefined}
              ratings={content.ratings}
              topicId={topic.id}
              variant="inline"
              viewer={content.viewer}
            />
            {!previewContent && (
              <PostPagination
                page={page}
                totalPosts={content.totalPosts ?? 0}
                pending={loadingContent}
                onSelect={(target) => {
                  setLoadingContent(true);
                  if (target === "last") void loadContributions("last");
                  else setPage(target);
                }}
              />
            )}
            {contentError && (
              <p role="status" className="text-xs text-ink-3">
                Live updates paused — your draft is safe.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-danger-line bg-danger-wash p-4">
            <p className="text-[13px] font-semibold text-danger">
              {contentError ?? "Posts couldn't load."}
            </p>
            <Button
              className="mt-3"
              onClick={() => void loadContributions()}
              size="sm"
              variant="secondary"
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <article className="group relative bg-surface px-4 py-3.5 transition-colors hover:bg-sunken sm:px-5 sm:py-4">
      <div className="flex items-center gap-2">
        <TopicLabels topic={topic} />
      </div>

      <Link
        aria-label={`Open ${topic.title}`}
        className="group/title mt-1.5 block outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-navy/35"
        href={topicHref}
      >
        <h3 className="t-post-title text-ink transition-colors group-hover/title:text-navy">
          {topic.title}
        </h3>
        <p className="reading-copy mt-1 line-clamp-2 text-[13.5px] leading-6 text-ink-3">
          {topic.openingBody}
        </p>
      </Link>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {typeof totalInteractions === "number" ? (
          <Link
            aria-label={`Open interactions for ${topic.title}, ${totalInteractions} total posts and replies`}
            className="inline-flex items-center gap-1.5 rounded text-[12.5px] font-semibold text-ink-2 outline-none transition-colors hover:text-navy focus-visible:ring-2 focus-visible:ring-navy/35"
            href={topicHref}
          >
            <ReplyIcon size={14} className="text-ink-4" />
            {totalInteractions}
          </Link>
        ) : null}

        {topic.openingEntryId ? (
          <Link
            aria-label={
              hasRating
                ? `Opening post rating ${ratingAverage?.toFixed(1)} from ${ratingCount} ratings`
                : `Rate the opening post for ${topic.title}`
            }
            className="inline-flex items-center gap-1.5 rounded text-[12.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-navy/35"
            href={topicHref}
          >
            <StarIcon
              size={14}
              filled={hasRating}
              className={hasRating ? ratingTone(ratingAverage) : "text-ink-4"}
            />
            {hasRating ? (
              <span className={ratingTone(ratingAverage)}>
                {ratingAverage?.toFixed(1)}
                <span className="font-medium text-ink-4"> ({ratingCount})</span>
              </span>
            ) : (
              <span className="text-ink-3">Rate</span>
            )}
          </Link>
        ) : null}

        <div className="ml-auto flex min-w-0 items-center gap-1.5 text-[12.5px]">
          <AuthorLink
            className="font-semibold text-ink-2"
            displayName={topic.authorDisplayName}
            href={authorHref}
            username={topic.authorUsername}
          />
          <span className="shrink-0 text-ink-4" suppressHydrationWarning>
            · {timeAgo(topic.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

/** Colour a score by what it says: hot take, solid, middling, poor. */
function ratingTone(average?: number) {
  if (average === undefined) return "rate-mid";
  if (average >= 8) return "rate-hot";
  if (average >= 6.5) return "rate-good";
  if (average >= 5) return "rate-mid";
  return "rate-low";
}

function TopicHeader({ topic }: { topic: TopicListItem }) {
  return (
    <div className="grid gap-2">
      <TopicLabels topic={topic} />
      <h2 className="topic-heading t-topic-title text-ink">{topic.title}</h2>
    </div>
  );
}

/** Category · club · source, kept on one quiet line above the title. */
function TopicLabels({ topic }: { topic: TopicListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <TopicTypeTag type={topic.topicType} />
      {topic.clubName ? (
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-navy">
          {topic.clubName}
        </span>
      ) : null}
      {topic.sourceUrl ? (
        <>
          <span aria-hidden className="text-[10px] text-line-strong">
            ·
          </span>
          <SourceBadge sourceUrl={topic.sourceUrl} />
        </>
      ) : null}
    </div>
  );
}

function ContributionsSkeleton() {
  return (
    <div aria-label="Loading posts" className="grid gap-3" role="status">
      <div className="h-36 animate-pulse rounded-lg border border-line bg-surface" />
      <div className="h-28 animate-pulse rounded-lg border border-line bg-surface" />
      <span className="sr-only">Loading posts…</span>
    </div>
  );
}
