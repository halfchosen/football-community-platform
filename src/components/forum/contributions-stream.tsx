"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";
import { ClubAvatar } from "@/components/onboarding/club-avatar";
import { LoginActionPrompt } from "@/components/forum/login-action-prompt";
import { RatingWidget } from "@/components/forum/rating-widget";
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
  participation?: { role: ParticipationRole; guestRemaining: number | null };
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
  const [confirmedActions, setConfirmedActions] = useState<OptimisticAction[]>([]);
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
  const composerName =
    viewer?.displayName ??
    viewer?.username ??
    (previewMode ? "Preview User" : "You");
  const composerId =
    variant === "inline" ? `composer-${topicId}` : "contribution-composer";

  function consumeGuestSlot() {
    if (!isGuest) {
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
      consumeGuestSlot();
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
      {optimisticContributions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm font-medium text-slate-400">
          Be the first to jump in.
        </p>
      ) : (
        <ul className="grid gap-3">
          {optimisticContributions.map((contribution) => (
            <li key={contribution.id}>
              <ContributionItem
                contribution={contribution}
                guestBlocked={guestBlocked}
                loggedOut={loggedOut}
                onSubmitReply={handleReplySubmit}
                previewMode={previewMode}
                profileHref={previewProfileHref}
                rating={ratings[contribution.id]}
                ratings={ratings}
                leadingContent={
                  contribution.isOpening ? openingHeader : undefined
                }
                trailingAction={
                  contribution.isOpening ? openingTrailingAction : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {loggedOut ? (
        <LoginActionPrompt variant="banner" />
      ) : guestBlocked ? (
        <GuestLimitNotice blocked />
      ) : (
        <div
          className="grid scroll-mt-24 gap-2.5 rounded-2xl border border-violet-200/80 bg-white p-3 shadow-sm shadow-violet-900/[0.04]"
          id={composerId}
        >
          {isGuest ? <GuestLimitNotice remaining={guestRemaining} /> : null}
          <form action={handleContributionSubmit} className="grid gap-2.5" noValidate>
            {actionState && "formError" in actionState && actionState.formError ? (
              <FormAlert message={actionState.formError} />
            ) : null}
            <input name="topicId" type="hidden" value={topicId} />
            <div className="flex items-start gap-2.5">
              <ClubAvatar name={composerName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-3 px-0.5">
                  <p className="text-xs font-extrabold text-slate-700">New post</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {body.length > CONTRIBUTION_MAX - 500
                      ? `${body.length}/${CONTRIBUTION_MAX}`
                      : "Your take"}
                  </span>
                </div>
                <textarea
                  aria-label="Write your take"
                  className="min-h-11 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 hover:bg-white focus:min-h-20 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/15"
                  maxLength={CONTRIBUTION_MAX}
                  name="body"
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write your take…"
                  required
                  rows={1}
                  value={body}
                />
                {actionState && "fieldError" in actionState && actionState.fieldError ? (
                  <div className="mt-1.5">
                    <FieldError message={actionState.fieldError} />
                  </div>
                ) : null}
                <div className="mt-2 flex justify-end">
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
  rating,
  ratings,
  loggedOut,
  guestBlocked,
  previewMode,
  profileHref,
  onSubmitReply,
  leadingContent,
  trailingAction,
}: {
  contribution: ContributionView;
  rating?: { averageScore: number; ratingCount: number; myScore: number | null };
  ratings: ContentRatingMap;
  loggedOut: boolean;
  guestBlocked: boolean;
  previewMode: boolean;
  profileHref?: string;
  onSubmitReply: (
    contributionId: string,
    body: string,
  ) => Promise<SubmissionResult>;
  leadingContent?: ReactNode;
  trailingAction?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyState, setReplyState] = useState<SubmissionResult | null>(null);
  const authorName =
    contribution.authorDisplayName ?? contribution.authorUsername;
  const authorHref =
    profileHref ?? `/u/${encodeURIComponent(contribution.authorUsername)}`;
  const isOptimistic = contribution.id.startsWith("optimistic-");
  const panelId = `replies-${contribution.id}`;
  const replyCount = contribution.replies.length;
  const replyLabel =
    replyCount > 0
      ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
      : "Reply";

  async function submitReply(formData: FormData) {
    const submittedBody = String(formData.get("body") ?? "").trim();
    setReplyState(null);
    setReplyBody("");
    const result = await onSubmitReply(contribution.id, submittedBody);
    setReplyState(result);

    if (!result.success) {
      setReplyBody(submittedBody);
    }
  }

  return (
    <article
      aria-busy={isOptimistic}
      className={`overflow-hidden rounded-2xl border border-violet-300/80 bg-white shadow-sm shadow-violet-900/[0.045] transition hover:border-violet-400 ${
        isOptimistic ? "opacity-70" : "opacity-100"
      }`}
    >
      {leadingContent ? (
        <div className="border-b border-violet-100 px-3.5 py-3.5 sm:px-4 sm:py-4">
          {leadingContent}
        </div>
      ) : null}
      <div className="flex gap-3 px-3.5 py-3.5 sm:px-4 sm:py-4">
        <div className="shrink-0 pt-0.5">
          <Link
            aria-label={`Open ${authorName}'s profile`}
            className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            href={authorHref}
          >
            <ClubAvatar name={authorName} size="md" />
          </Link>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
                <p className="min-w-0 truncate font-bold text-slate-900">
                  <Link className="transition hover:text-violet-700" href={authorHref}>
                    {authorName}
                  </Link>
                </p>
                <span className="truncate text-xs font-medium text-slate-400">
                  @{contribution.authorUsername}
                </span>
                <span className="text-xs text-slate-300">·</span>
                <span
                  className="text-xs font-medium text-slate-400"
                  suppressHydrationWarning
                >
                  {timeAgo(contribution.createdAt)}
                </span>
              </div>
              {contribution.authorClubName || contribution.authorTitleName ? (
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {[contribution.authorClubName, contribution.authorTitleName]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">
            {contribution.body}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {isOptimistic ? (
              <span className="animate-pulse rounded-full bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-600">
                Posting…
              </span>
            ) : (
              <>
                <button
                  aria-controls={panelId}
                  aria-expanded={expanded}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
                    expanded
                      ? "bg-violet-100 text-violet-700"
                      : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                  onClick={() => setExpanded((current) => !current)}
                  type="button"
                >
                  <ReplyIcon />
                  <span>{replyLabel}</span>
                  <ChevronIcon expanded={expanded} />
                </button>
                <RatingWidget
                  averageScore={rating?.averageScore ?? 0}
                  compact
                  loginPrompt={loggedOut}
                  myScore={rating?.myScore ?? null}
                  previewMode={previewMode}
                  ratingCount={rating?.ratingCount ?? 0}
                  targetId={contribution.id}
                  targetType="entry"
                />
                {trailingAction ? (
                  <span className="ml-auto">{trailingAction}</span>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {expanded ? (
        <div
          className="border-t border-violet-100 bg-violet-50/45 px-3.5 py-3.5 motion-safe:animate-[discussion-panel-in_180ms_ease-out] sm:px-4 sm:pl-[4.65rem]"
          id={panelId}
        >
          <div className="relative pl-5">
            <span
              aria-hidden
              className="absolute bottom-1 left-0 top-1 w-px bg-violet-200"
            />
            <span
              aria-hidden
              className="absolute left-[-3px] top-[7px] h-[7px] w-[7px] rounded-full bg-violet-500 ring-4 ring-violet-50"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold text-slate-700">
                Replies to <span className="text-violet-700">@{contribution.authorUsername}</span>
              </p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-500 ring-1 ring-violet-100">
                {replyCount}
              </span>
            </div>

            {replyCount === 0 ? (
              <p className="py-3 text-xs font-medium text-slate-400">
                No replies yet. Start this thread.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-violet-100/80">
                {contribution.replies.map((reply) => (
                  <li key={reply.id}>
                    <ReplyItem
                      loginPrompt={loggedOut}
                      previewMode={previewMode}
                      profileHref={profileHref}
                      rating={ratings[reply.id]}
                      reply={reply}
                    />
                  </li>
                ))}
              </ul>
            )}

            <div className={replyCount > 0 ? "border-t border-violet-100 pt-3" : ""}>
              {loggedOut ? (
                <LoginActionPrompt
                  triggerClassName="inline-flex h-8 items-center justify-center rounded-full bg-violet-700 px-3 text-xs font-bold text-white transition hover:bg-violet-600"
                  triggerLabel="Log in to reply"
                  variant="inline"
                />
              ) : guestBlocked ? (
                <GuestLimitNotice blocked />
              ) : (
                <form action={submitReply} className="grid gap-2" noValidate>
                  {replyState?.formError ? (
                    <FormAlert message={replyState.formError} />
                  ) : null}
                  <textarea
                    aria-label={`Reply to ${authorName}`}
                    className="min-h-11 w-full resize-y rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:min-h-16 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                    maxLength={REPLY_MAX}
                    name="body"
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder={`Reply to @${contribution.authorUsername}…`}
                    required
                    rows={1}
                    value={replyBody}
                  />
                  {replyState?.fieldError ? (
                    <FieldError message={replyState.fieldError} />
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium text-slate-400">
                      Replying to @{contribution.authorUsername}
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
}: {
  reply: ReplyView;
  profileHref?: string;
  rating?: { averageScore: number; ratingCount: number; myScore: number | null };
  loginPrompt: boolean;
  previewMode: boolean;
}) {
  const authorName = reply.authorDisplayName ?? reply.authorUsername;
  const authorHref = profileHref ?? `/u/${encodeURIComponent(reply.authorUsername)}`;
  const isOptimistic = reply.id.startsWith("optimistic-");

  return (
    <article className={`flex gap-2.5 py-2.5 ${isOptimistic ? "opacity-70" : ""}`}>
      <Link className="shrink-0 rounded-full" href={authorHref}>
        <ClubAvatar name={authorName} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <Link
            className="text-xs font-extrabold text-slate-900 hover:text-violet-700"
            href={authorHref}
          >
            {authorName}
          </Link>
          <span className="text-[11px] font-medium text-slate-400">
            @{reply.authorUsername}
          </span>
          <span className="text-[11px] text-slate-300">·</span>
          <span
            className="text-[11px] font-medium text-slate-400"
            suppressHydrationWarning
          >
            {timeAgo(reply.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{reply.body}</p>
        <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
          {isOptimistic ? (
            <span className="animate-pulse px-2 text-violet-600">Posting…</span>
          ) : (
            <RatingWidget
              averageScore={rating?.averageScore ?? 0}
              compact
              loginPrompt={loginPrompt}
              myScore={rating?.myScore ?? null}
              previewMode={previewMode}
              ratingCount={rating?.ratingCount ?? 0}
              targetId={reply.id}
              targetType="comment"
            />
          )}
        </div>
      </div>
    </article>
  );
}

function ReplyIcon() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.5A8.6 8.6 0 1 1 21 11.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="m6 8 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function GuestLimitNotice({
  remaining,
  blocked = false,
}: {
  remaining?: number;
  blocked?: boolean;
}) {
  return (
    <p
      className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium leading-relaxed ring-1 ${
        blocked
          ? "bg-slate-100 text-slate-600 ring-slate-200"
          : "bg-amber-50 text-amber-800 ring-amber-200"
      }`}
      role="status"
    >
      <span aria-hidden className="mt-px">{blocked ? "🔒" : "👋"}</span>
      {blocked
        ? GUEST_LIMIT_REACHED_MESSAGE
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
    <button
      className="rounded-full bg-violet-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-violet-700/20 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-1.5 text-sm text-rose-600" role="alert">
      <span aria-hidden>⚠️</span>
      {message}
    </p>
  );
}

function FormAlert({ message }: { message: string }) {
  return (
    <p
      className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
      role="alert"
    >
      <span aria-hidden>⚠️</span>
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
    authorDisplayName: viewer?.displayName ?? (previewMode ? "Preview User" : "You"),
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
    authorDisplayName: viewer?.displayName ?? (previewMode ? "Preview User" : "You"),
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
    };
  });
}
