"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";
import { ContentActions } from "@/components/community/content-actions";
import { ClubAvatar } from "@/components/onboarding/club-avatar";
import {
  AuthComposerPrompt,
  AuthInlinePrompt,
} from "@/components/forum/login-action-prompt";
import { RatingWidget } from "@/components/forum/rating-widget";
import { Button, InlineAction } from "@/components/ui/button";
import { textareaClassName } from "@/components/ui/field";
import {
  AlertIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
  ReplyIcon,
} from "@/components/ui/icons";
import {
  CONTRIBUTION_MAX,
  REPLY_MAX,
  validateContributionBody,
  validateReplyBody,
} from "@/domains/forum/contributions";
import {
  GUEST_LIMIT_REACHED_MESSAGE,
  guestRemainingMessage,
  type ParticipationRole,
} from "@/domains/forum/participation";
import type {
  ContentRatingMap,
  ContributionView,
  DiscussionViewer,
  ReplyView,
} from "@/domains/forum/discussion";
import { timeAgo } from "@/lib/utils/date";
import {
  createContribution,
  type CreateContributionActionState,
} from "@/server/actions/forum/create-contribution";
import {
  createReply,
  type CreateReplyActionState,
} from "@/server/actions/forum/create-reply";

export type { ContentRatingMap } from "@/domains/forum/discussion";

type ContributionsStreamProps = {
  topicId: string;
  contributions: ContributionView[];
  ratings: ContentRatingMap;
  participation?: {
    role: ParticipationRole;
    guestRemaining: number | null;
    guestRepliesRemaining?: number | null;
  };
  previewMode?: boolean;
  onContributionAdded?: () => void;
  loggedOut?: boolean;
  previewProfileHref?: string;
  viewer?: DiscussionViewer | null;
  variant?: "page" | "inline";
  /** Topic metadata rendered inside the opening post card. */
  openingHeader?: ReactNode;
  /** A subtle opening-post-only action such as Share. */
  openingTrailingAction?: ReactNode;
};

type OptimisticAction =
  | { type: "contribution"; contribution: ContributionView }
  | { type: "reply"; contributionId: string; reply: ReplyView };

type SubmissionResult = {
  success: boolean;
  fieldError?: string;
  formError?: string;
};

export function ContributionsStream({
  topicId,
  contributions,
  ratings,
  participation = { role: "member", guestRemaining: null },
  previewMode = false,
  onContributionAdded,
  loggedOut = false,
  previewProfileHref,
  viewer = null,
  variant = "page",
  openingHeader,
  openingTrailingAction,
}: ContributionsStreamProps) {
  const [body, setBody] = useState("");
  const [actionState, setActionState] =
    useState<CreateContributionActionState>(null);
  const [confirmedActions, setConfirmedActions] = useState<OptimisticAction[]>(
    [],
  );
  const [previousContributions, setPreviousContributions] =
    useState(contributions);
  if (previousContributions !== contributions) {
    setPreviousContributions(contributions);
    setConfirmedActions([]);
  }
  const [localReplyRemaining, setLocalReplyRemaining] = useState<number | null>(
    null,
  );
  const [localGuestRemaining, setLocalGuestRemaining] = useState<number | null>(
    null,
  );
  const confirmedContributions = confirmedActions.reduce(
    applyContentAction,
    contributions,
  );
  const [optimisticContributions, addOptimisticAction] = useOptimistic<
    ContributionView[],
    OptimisticAction
  >(confirmedContributions, applyContentAction);
  const isGuest = participation.role === "guest";
  const serverGuestRemaining = participation.guestRemaining ?? 0;
  const guestRemaining =
    localGuestRemaining === null
      ? serverGuestRemaining
      : Math.min(serverGuestRemaining, localGuestRemaining);
  const guestBlocked = isGuest && guestRemaining <= 0;
  const replyBlocked =
    isGuest &&
    Math.min(
      localReplyRemaining ?? 3,
      participation.guestRepliesRemaining ?? 3,
    ) <= 0;
  const composerName =
    viewer?.displayName ??
    viewer?.username ??
    (previewMode ? "Preview User" : "You");
  const composerId =
    variant === "inline" ? `composer-${topicId}` : "contribution-composer";

  function consumeGuestSlot(reply = false) {
    if (!isGuest) {
      return;
    }

    if (reply) {
      setLocalReplyRemaining((current) =>
        Math.max(0, (current ?? participation.guestRepliesRemaining ?? 3) - 1),
      );
      return;
    }
    setLocalGuestRemaining((current) =>
      Math.max((current ?? serverGuestRemaining) - 1, 0),
    );
  }

  async function handleContributionSubmit(formData: FormData) {
    const submittedBody = String(formData.get("body") ?? "").trim();
    const fieldError = validateContributionBody(submittedBody);

    if (fieldError) {
      setActionState({ fieldError });
      return;
    }

    const optimisticContribution = makeOptimisticContribution(
      submittedBody,
      viewer,
      previewMode,
    );

    setActionState(null);
    addOptimisticAction({
      type: "contribution",
      contribution: optimisticContribution,
    });
    setBody("");

    let result: CreateContributionActionState;

    if (previewMode) {
      result = {
        success: true,
        contribution: {
          ...optimisticContribution,
          id: `preview-contribution-${crypto.randomUUID()}`,
        },
      };
    } else {
      try {
        result = await createContribution(null, formData);
      } catch (error) {
        console.error("Contribution submission failed", error);
        result = {
          formError: "We couldn't post that. Please try again.",
        };
      }
    }

    setActionState(result);

    if (result?.success) {
      setConfirmedActions((current) => [
        ...current,
        { type: "contribution", contribution: result.contribution },
      ]);
      consumeGuestSlot();
      onContributionAdded?.();
      return;
    }

    setBody(submittedBody);
  }

  async function handleReplySubmit(
    contributionId: string,
    submittedBody: string,
    replyToCommentId?: string,
    replyToUsername?: string,
  ): Promise<SubmissionResult> {
    const fieldError = validateReplyBody(submittedBody);

    if (fieldError) {
      return { success: false, fieldError };
    }

    const optimisticReply = makeOptimisticReply(
      submittedBody,
      viewer,
      previewMode,
    );
    optimisticReply.replyToCommentId = replyToCommentId;
    optimisticReply.replyToUsername = replyToUsername;

    addOptimisticAction({
      type: "reply",
      contributionId,
      reply: optimisticReply,
    });

    let result: CreateReplyActionState;

    if (previewMode) {
      result = {
        success: true,
        contributionId,
        reply: {
          ...optimisticReply,
          id: `preview-reply-${crypto.randomUUID()}`,
        },
      };
    } else {
      const formData = new FormData();
      if (replyToCommentId) formData.set("replyToCommentId", replyToCommentId);
      formData.set("topicId", topicId);
      formData.set("contributionId", contributionId);
      formData.set("body", submittedBody);

      try {
        result = await createReply(null, formData);
      } catch (error) {
        console.error("Reply submission failed", error);
        result = {
          formError: "We couldn't post your reply. Please try again.",
        };
      }
    }

    if (result?.success) {
      setConfirmedActions((current) => [
        ...current,
        {
          type: "reply",
          contributionId: result.contributionId,
          reply: result.reply,
        },
      ]);
      consumeGuestSlot(true);
      return { success: true };
    }

    return {
      success: false,
      fieldError: result?.fieldError,
      formError: result?.formError,
    };
  }

  return (
    <section
      className={variant === "inline" ? "grid gap-3" : "mt-1 grid gap-3"}
      id={variant === "inline" ? `contributions-${topicId}` : "contributions"}
    >
      {openingHeader && (
        <header className="topic-header order-1 rounded-lg border border-line">
          {openingHeader}
        </header>
      )}
      {optimisticContributions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong bg-surface px-4 py-8 text-center text-[13px] font-medium text-ink-3">
          No posts yet. Be the first to jump in.
        </p>
      ) : (
        <ul className="feed-stream order-3">
          {optimisticContributions.map((contribution) => (
            <li key={contribution.id}>
              <ContributionItem
                contribution={contribution}
                topicId={topicId}
                guestBlocked={replyBlocked}
                viewerUsername={viewer?.username}
                loggedOut={loggedOut}
                onSubmitReply={handleReplySubmit}
                previewMode={previewMode}
                profileHref={previewProfileHref}
                rating={ratings[contribution.id]}
                ratings={ratings}
                leadingContent={undefined}
                trailingAction={
                  contribution.isOpening ? openingTrailingAction : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {loggedOut ? (
        <div className="order-2">
          <AuthComposerPrompt />
        </div>
      ) : guestBlocked ? (
        <div className="order-2">
          <GuestLimitNotice blocked canReply={!replyBlocked} />
        </div>
      ) : (
        <div className="composer-surface order-2 grid gap-3" id={composerId}>
          {isGuest ? <GuestLimitNotice remaining={guestRemaining} /> : null}
          <form
            action={handleContributionSubmit}
            className="grid gap-2.5"
            noValidate
          >
            {actionState &&
            "formError" in actionState &&
            actionState.formError ? (
              <FormAlert message={actionState.formError} />
            ) : null}
            <input name="topicId" type="hidden" value={topicId} />
            <div className="flex items-start gap-2.5">
              <ClubAvatar name={composerName} size="md" />
              <div className="min-w-0 flex-1">
                <textarea
                  aria-label="Write your take"
                  className={`${textareaClassName} min-h-[64px]`}
                  maxLength={CONTRIBUTION_MAX}
                  name="body"
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write your take…"
                  required
                  rows={1}
                  value={body}
                />
                {actionState &&
                "fieldError" in actionState &&
                actionState.fieldError ? (
                  <div className="mt-1.5">
                    <FieldError message={actionState.fieldError} />
                  </div>
                ) : null}
                <div className="mt-2 flex items-center justify-end gap-3">
                  {body.length > CONTRIBUTION_MAX - 500 && (
                    <span className="text-[11px] font-semibold tabular-nums text-ink-4">
                      {body.length}/{CONTRIBUTION_MAX}
                    </span>
                  )}
                  <SubmitButton label="Post" pendingLabel="Posting…" />
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function ContributionItem({
  contribution,
  topicId,
  rating,
  ratings,
  loggedOut,
  guestBlocked,
  previewMode,
  profileHref,
  onSubmitReply,
  leadingContent,
  trailingAction,
  viewerUsername,
}: {
  contribution: ContributionView;
  topicId: string;
  viewerUsername?: string;
  rating?: {
    averageScore: number;
    ratingCount: number;
    myScore: number | null;
  };
  ratings: ContentRatingMap;
  loggedOut: boolean;
  guestBlocked: boolean;
  previewMode: boolean;
  profileHref?: string;
  onSubmitReply: (
    contributionId: string,
    body: string,
    replyToCommentId?: string,
    replyToUsername?: string,
  ) => Promise<SubmissionResult>;
  leadingContent?: ReactNode;
  trailingAction?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyTarget, setReplyTarget] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [replyState, setReplyState] = useState<SubmissionResult | null>(null);
  const [previewDeleted, setPreviewDeleted] = useState(false);
  const isDeleted = previewMode
    ? previewDeleted
    : contribution.status === "deleted";
  const authorName =
    contribution.authorDisplayName ?? contribution.authorUsername;
  const authorHref =
    profileHref ?? `/u/${encodeURIComponent(contribution.authorUsername)}`;
  const isOptimistic = contribution.id.startsWith("optimistic-");
  const panelId = `replies-${contribution.id}`;
  const replyCount = contribution.replyCount ?? contribution.replies.length;
  const [replyOffset, setReplyOffset] = useState(0);
  const [replyPage, setReplyPage] = useState<{
    replies: ReplyView[];
    ratings: ContentRatingMap;
  } | null>(null);
  const [replyPageError, setReplyPageError] = useState(false);
  useEffect(() => {
    if (!expanded || replyOffset === 0 || previewMode) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(
          `/api/forum/${topicId}/replies?entry=${contribution.id}&offset=${replyOffset}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Replies unavailable");
        setReplyPage(await response.json());
        setReplyPageError(false);
      } catch {
        if (!controller.signal.aborted) setReplyPageError(true);
      }
    })();
    return () => controller.abort();
  }, [
    expanded,
    replyOffset,
    previewMode,
    topicId,
    contribution.id,
    contribution.replies,
  ]);
  const visibleReplies =
    replyOffset === 0 ? contribution.replies : (replyPage?.replies ?? []);
  function changeReplyPage(offset: number) {
    setReplyPage(null);
    setReplyPageError(false);
    setReplyOffset(offset);
  }

  const replyLabel =
    replyCount > 0
      ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
      : "Reply";

  async function submitReply(formData: FormData) {
    const submittedBody = String(formData.get("body") ?? "").trim();
    setReplyState(null);
    setReplyBody("");
    const result = await onSubmitReply(
      contribution.id,
      submittedBody,
      replyTarget?.id,
      replyTarget?.username,
    );
    setReplyState(result);

    if (!result.success) {
      setReplyBody(submittedBody);
    } else if (!previewMode) {
      if (replyCount >= 10)
        changeReplyPage(10 + Math.floor((replyCount - 10) / 20) * 20);
      window.dispatchEvent(new Event("community:content-changed"));
    }
  }

  return (
    <article
      id={`post-${contribution.id}`}
      aria-busy={isOptimistic}
      className={`bg-surface transition-opacity ${
        isOptimistic ? "opacity-60" : "opacity-100"
      }`}
    >
      {leadingContent ? (
        <div className="border-b border-line px-4 py-3.5 sm:px-5">
          {leadingContent}
        </div>
      ) : null}
      <div className="post-frame flex gap-3 px-4 py-4 sm:px-5">
        <div className="shrink-0 pt-0.5">
          <Link
            aria-label={`Open ${authorName}'s profile`}
            className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2"
            href={authorHref}
          >
            <ClubAvatar name={authorName} size="md" />
          </Link>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <Link
                  className="min-w-0 truncate text-[13.5px] font-bold text-ink transition-colors hover:text-navy"
                  href={authorHref}
                >
                  {authorName}
                </Link>
                <span className="truncate text-[12.5px] font-medium text-ink-4">
                  @{contribution.authorUsername}
                </span>
                {contribution.authorGenerationName && (
                  <span className="rounded-[3px] bg-accent-wash px-1.5 text-[10px] font-bold leading-4 text-accent-strong">
                    {contribution.authorGenerationName}
                  </span>
                )}
                <span className="text-[12.5px] text-line-strong">·</span>
                <span
                  className="text-[12.5px] font-medium text-ink-4"
                  suppressHydrationWarning
                >
                  {timeAgo(contribution.createdAt)}
                </span>
              </div>
              {contribution.authorClubName || contribution.authorTitleName ? (
                <p className="mt-0.5 text-[11.5px] font-medium text-ink-4">
                  {[contribution.authorClubName, contribution.authorTitleName]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className={`post-text mt-1.5 whitespace-pre-line ${
              isDeleted ? "italic text-ink-4" : ""
            }`}
          >
            {isDeleted ? "This post was deleted." : contribution.body}
          </div>

          <div className="-ml-2 mt-2 flex flex-wrap items-center gap-0.5">
            {isOptimistic ? (
              <span className="ml-2 animate-pulse text-[12.5px] font-semibold text-ink-3">
                Posting…
              </span>
            ) : (
              <>
                <InlineAction
                  active={expanded}
                  aria-controls={panelId}
                  aria-expanded={expanded}
                  onClick={() => setExpanded((current) => !current)}
                >
                  <ReplyIcon size={14} />
                  <span>{replyLabel}</span>
                  <ChevronDownIcon
                    size={13}
                    className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </InlineAction>
                {!isDeleted && (
                  <RatingWidget
                    averageScore={rating?.averageScore ?? 0}
                    compact
                    owned={viewerUsername === contribution.authorUsername}
                    loginPrompt={loggedOut}
                    myScore={rating?.myScore ?? null}
                    previewMode={previewMode}
                    ratingCount={rating?.ratingCount ?? 0}
                    targetId={contribution.id}
                    targetType="entry"
                  />
                )}
                {!loggedOut && (
                  <ContentActions
                    id={contribution.id}
                    kind="entry"
                    owned={viewerUsername === contribution.authorUsername}
                    deleted={isDeleted}
                    onChanged={
                      previewMode
                        ? (operation) =>
                            setPreviewDeleted(operation !== "restore")
                        : undefined
                    }
                    preview={previewMode}
                  />
                )}
                {trailingAction ? (
                  <span className="ml-auto flex items-center gap-0.5">
                    {trailingAction}
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {expanded ? (
        <div
          className="border-t border-line bg-sunken px-4 py-3.5 motion-safe:animate-[discussion-panel-in_180ms_ease-out] sm:pl-[4.25rem] sm:pr-5"
          id={panelId}
        >
          <div className="relative pl-4">
            <span
              aria-hidden
              className="absolute bottom-1 left-0 top-1.5 w-px bg-line-strong"
            />
            <span
              aria-hidden
              className="absolute left-[-2.5px] top-[7px] h-[6px] w-[6px] rounded-full bg-navy ring-4 ring-sunken"
            />
            <p className="text-[11.5px] font-bold text-ink-2">
              Replies to{" "}
              <span className="text-navy">@{contribution.authorUsername}</span>
              <span className="ml-1.5 font-semibold text-ink-4">
                {replyCount}
              </span>
            </p>

            {replyCount === 0 ? (
              <p className="py-3 text-[12.5px] font-medium text-ink-4">
                No replies yet. Start this thread.
              </p>
            ) : (
              <ul className="mt-1 divide-y divide-line">
                {visibleReplies.map((reply) => (
                  <li key={reply.id}>
                    <ReplyItem
                      loginPrompt={loggedOut}
                      previewMode={previewMode}
                      profileHref={profileHref}
                      rating={replyPage?.ratings[reply.id] ?? ratings[reply.id]}
                      reply={reply}
                      viewerUsername={viewerUsername}
                      onReply={() => {
                        setReplyTarget({
                          id: reply.id,
                          username: reply.authorUsername,
                        });
                        setReplyBody("");
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {replyPageError && (
              <p role="alert" className="text-xs text-danger">
                Replies could not load. Go back and try again.
              </p>
            )}
            {!previewMode && replyCount > 10 && (
              <nav
                aria-label="Reply pages"
                className="mb-3 flex items-center justify-between text-[12px] font-semibold text-ink-3"
              >
                <button
                  disabled={replyOffset === 0}
                  onClick={() =>
                    changeReplyPage(replyOffset <= 10 ? 0 : replyOffset - 20)
                  }
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 transition-colors hover:text-navy disabled:opacity-30"
                >
                  <ChevronLeftIcon size={13} />
                  Previous
                </button>
                <span className="tabular-nums">
                  {replyOffset + 1}–
                  {Math.min(
                    replyOffset + (replyOffset === 0 ? 10 : 20),
                    replyCount,
                  )}{" "}
                  of {replyCount}
                </span>
                <button
                  disabled={
                    replyOffset + (replyOffset === 0 ? 10 : 20) >= replyCount
                  }
                  onClick={() =>
                    changeReplyPage(replyOffset === 0 ? 10 : replyOffset + 20)
                  }
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 transition-colors hover:text-navy disabled:opacity-30"
                >
                  More replies
                  <ChevronRightIcon size={13} />
                </button>
              </nav>
            )}
            <div className={replyCount > 0 ? "border-t border-line pt-3" : ""}>
              {contribution.status === "deleted" ? (
                <p className="text-[12.5px] text-ink-3">
                  This post was deleted. Existing replies stay here for context.
                </p>
              ) : loggedOut ? (
                <AuthInlinePrompt label="Log in to reply" reason="reply" />
              ) : guestBlocked ? (
                <GuestLimitNotice blocked kind="reply" />
              ) : (
                <form action={submitReply} className="grid gap-2" noValidate>
                  {replyState?.formError ? (
                    <FormAlert message={replyState.formError} />
                  ) : null}
                  <textarea
                    aria-label={`Reply to ${replyTarget?.username ?? authorName}`}
                    className={`${textareaClassName} min-h-10`}
                    maxLength={REPLY_MAX}
                    name="body"
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder={`Reply to @${replyTarget?.username ?? contribution.authorUsername}…`}
                    required
                    rows={1}
                    value={replyBody}
                  />
                  {replyState?.fieldError ? (
                    <FieldError message={replyState.fieldError} />
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11.5px] font-medium text-ink-4">
                      Replying to @
                      {replyTarget?.username ?? contribution.authorUsername}
                      {replyTarget && (
                        <button
                          type="button"
                          onClick={() => setReplyTarget(null)}
                          className="ml-2 font-semibold text-navy hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </span>
                    <SubmitButton label="Reply" pendingLabel="Posting…" />
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ReplyItem({
  reply,
  profileHref,
  rating,
  loginPrompt,
  previewMode,
  onReply,
  viewerUsername,
}: {
  onReply: () => void;
  viewerUsername?: string;
  reply: ReplyView;
  profileHref?: string;
  rating?: {
    averageScore: number;
    ratingCount: number;
    myScore: number | null;
  };
  loginPrompt: boolean;
  previewMode: boolean;
}) {
  const authorName = reply.authorDisplayName ?? reply.authorUsername;
  const authorHref =
    profileHref ?? `/u/${encodeURIComponent(reply.authorUsername)}`;
  const isOptimistic = reply.id.startsWith("optimistic-");

  return (
    <article
      className={`flex gap-2.5 py-2.5 ${isOptimistic ? "opacity-60" : ""}`}
    >
      <Link className="shrink-0 rounded-full" href={authorHref}>
        <ClubAvatar name={authorName} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <Link
            className="text-[12.5px] font-bold text-ink transition-colors hover:text-navy"
            href={authorHref}
          >
            {authorName}
          </Link>
          <span className="text-[11.5px] font-medium text-ink-4">
            @{reply.authorUsername}
          </span>
          <span className="text-[11.5px] text-line-strong">·</span>
          <span
            className="text-[11.5px] font-medium text-ink-4"
            suppressHydrationWarning
          >
            {timeAgo(reply.createdAt)}
          </span>
        </div>
        <p className="post-text mt-0.5 whitespace-pre-wrap text-[13.5px]">
          {reply.replyToUsername && (
            <span className="mr-1 font-semibold text-navy">
              @{reply.replyToUsername}
            </span>
          )}
          {reply.body}
        </p>
        <div className="-ml-2 mt-0.5 flex items-center gap-0.5">
          {isOptimistic ? (
            <span className="ml-2 animate-pulse text-[12px] font-semibold text-ink-3">
              Posting…
            </span>
          ) : (
            <>
              {!loginPrompt && reply.status !== "deleted" && (
                <InlineAction onClick={onReply}>
                  <ReplyIcon size={13} />
                  Reply
                </InlineAction>
              )}
              {!loginPrompt && (
                <ContentActions
                  id={reply.id}
                  kind="comment"
                  owned={viewerUsername === reply.authorUsername}
                  deleted={reply.status === "deleted"}
                  preview={previewMode}
                />
              )}
              {reply.status !== "deleted" && (
                <RatingWidget
                  averageScore={rating?.averageScore ?? 0}
                  compact
                  loginPrompt={loginPrompt}
                  myScore={rating?.myScore ?? null}
                  previewMode={previewMode}
                  ratingCount={rating?.ratingCount ?? 0}
                  owned={viewerUsername === reply.authorUsername}
                  targetId={reply.id}
                  targetType="comment"
                />
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function GuestLimitNotice({
  remaining,
  blocked = false,
  kind = "post",
  canReply = true,
}: {
  remaining?: number;
  blocked?: boolean;
  kind?: "post" | "reply";
  canReply?: boolean;
}) {
  return (
    <p
      className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-[13px] font-medium leading-6 ${
        blocked
          ? "border-line bg-sunken text-ink-2"
          : "border-accent-line bg-accent-wash text-accent-strong"
      }`}
      role="status"
    >
      {blocked ? (
        <LockIcon size={15} className="mt-0.5 shrink-0" />
      ) : (
        <AlertIcon size={15} className="mt-0.5 shrink-0" />
      )}
      {blocked
        ? kind === "reply"
          ? "You’ve used today’s away replies for this club. You can still read and rate. Replies reset at midnight UTC."
          : canReply
            ? GUEST_LIMIT_REACHED_MESSAGE
            : "You’ve used today’s away posts and replies for this club. You can still read and rate. Your allowance resets at midnight UTC."
        : guestRemainingMessage(remaining ?? 0)}
    </p>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? pendingLabel : label}
    </Button>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      className="flex items-start gap-1.5 text-[12.5px] font-medium text-danger"
      role="alert"
    >
      <AlertIcon size={14} className="mt-px shrink-0" />
      {message}
    </p>
  );
}

function FormAlert({ message }: { message: string }) {
  return (
    <p
      className="flex items-start gap-2 rounded-md border border-danger-line bg-danger-wash px-3 py-2.5 text-[13px] font-medium leading-6 text-danger"
      role="alert"
    >
      <AlertIcon size={15} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}

function makeOptimisticContribution(
  body: string,
  viewer: DiscussionViewer | null,
  previewMode: boolean,
): ContributionView {
  return {
    id: `optimistic-contribution-${crypto.randomUUID()}`,
    body,
    isOpening: false,
    createdAt: new Date().toISOString(),
    authorUsername: viewer?.username ?? (previewMode ? "preview_user" : "you"),
    authorDisplayName:
      viewer?.displayName ?? (previewMode ? "Preview User" : "You"),
    authorClubName: null,
    authorTitleName: null,
    authorLevel: null,
    replies: [],
  };
}

function makeOptimisticReply(
  body: string,
  viewer: DiscussionViewer | null,
  previewMode: boolean,
): ReplyView {
  return {
    id: `optimistic-reply-${crypto.randomUUID()}`,
    body,
    createdAt: new Date().toISOString(),
    authorUsername: viewer?.username ?? (previewMode ? "preview_user" : "you"),
    authorDisplayName:
      viewer?.displayName ?? (previewMode ? "Preview User" : "You"),
  };
}

function applyContentAction(
  contributions: ContributionView[],
  action: OptimisticAction,
): ContributionView[] {
  if (action.type === "contribution") {
    if (contributions.some((item) => item.id === action.contribution.id)) {
      return contributions;
    }

    return [...contributions, action.contribution];
  }

  return contributions.map((contribution) => {
    if (contribution.id !== action.contributionId) {
      return contribution;
    }

    if (contribution.replies.some((reply) => reply.id === action.reply.id)) {
      return contribution;
    }

    return {
      ...contribution,
      replies: [...contribution.replies, action.reply],
      replyCount: (contribution.replyCount ?? contribution.replies.length) + 1,
    };
  });
}
