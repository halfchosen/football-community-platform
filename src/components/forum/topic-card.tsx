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
              <p role="status" className="text-xs text-navy">
                Updates paused. Your draft is still here.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            <p>{contentError ?? "Posts couldn't load."}</p>
            <button
              className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
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
    <article className="group bg-white p-4 transition hover:bg-accent-soft/20 sm:p-5">
      <TopicLabels topic={topic} />

      <Link
        aria-label={`Open ${topic.title}`}
        className="group/title block outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2"
        href={topicHref}
      >
        <TopicTitleAndBody topic={topic} />
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {typeof totalInteractions === "number" ? (
          <Link
            aria-label={`Open interactions for ${topic.title}, ${totalInteractions} total posts and replies`}
            className="inline-flex items-center rounded-lg bg-accent-soft px-2.5 py-1.5 font-semibold text-navy outline-none transition hover:bg-mint focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2"
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
            className="rounded-lg px-2.5 py-1 font-semibold text-slate-500 outline-none transition hover:bg-slate-100 hover:text-navy focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2"
            href={topicHref}
          >
            <span aria-hidden className="text-navy">
              ★
            </span>{" "}
            {hasRating ? (
              <>
                {ratingAverage?.toFixed(1)}
                <span className="font-medium text-slate-400">
                  {" "}
                  ({ratingCount})
                </span>
              </>
            ) : (
              "Rate"
            )}
          </Link>
        ) : null}
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <AuthorLink
            className="font-semibold text-slate-600"
            displayName={topic.authorDisplayName}
            href={authorHref}
            username={topic.authorUsername}
          />
          <span className="shrink-0 text-slate-400" suppressHydrationWarning>
            · {timeAgo(topic.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

function TopicHeader({ topic }: { topic: TopicListItem }) {
  return (
    <div className="grid gap-2.5">
      <TopicLabels topic={topic} />
      <h3 className="topic-heading text-xl font-bold leading-snug tracking-tight text-navy sm:text-2xl">
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
      <h3 className="mt-2.5 text-[17px] font-bold leading-snug tracking-tight text-slate-950 decoration-navy decoration-1 underline-offset-4 transition group-hover/title:text-navy group-hover/title:underline">
        {topic.title}
      </h3>
      <p className="reading-copy mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {topic.openingBody}
      </p>
    </>
  );
}

function ContributionsSkeleton() {
  return (
    <div aria-label="Loading posts" className="grid gap-3" role="status">
      <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <span className="sr-only">Loading posts…</span>
    </div>
  );
}
