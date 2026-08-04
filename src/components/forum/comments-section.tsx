"use client";

import { useActionState, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import {
  createComment,
  type CreateCommentActionState,
} from "@/server/actions/forum/create-comment";
import {
  GUEST_LIMIT_REACHED_MESSAGE,
  guestRemainingMessage,
  type ParticipationRole,
} from "@/domains/forum/participation";
import { COMMENT_MAX, validateCommentBody } from "@/domains/forum/comments";
import type { CommentView } from "@/lib/db/queries/forum";
import { RatingWidget } from "@/components/forum/rating-widget";
import { LoginActionPrompt } from "@/components/forum/login-action-prompt";
import { ClubAvatar } from "@/components/onboarding/club-avatar";
import { timeAgo } from "@/components/forum/topic-card";

export type CommentRatingMap = Record<
  string,
  { averageScore: number; ratingCount: number; myScore: number | null }
>;

type CommentsSectionProps = {
  topicId: string;
  entryId: string | null;
  comments: CommentView[];
  ratings: CommentRatingMap;
  participation?: { role: ParticipationRole; guestRemaining: number | null };
  /** Preview hub: render everything but never call the server. */
  previewMode?: boolean;
  /** Keeps parent preview counters in sync with locally added comments. */
  onPreviewCommentAdded?: () => void;
  /** Logged-out viewer: read-only list + friendly login prompt, no form. */
  loggedOut?: boolean;
};

type ReplyTarget = { commentId: string; username: string } | null;

// Entry-stream discussion: each comment is a message with a compact action
// row; replies are lightly indented; the composer is pinned under the thread.
export function CommentsSection({
  topicId,
  entryId,
  comments,
  ratings,
  participation = { role: "member", guestRemaining: null },
  previewMode = false,
  onPreviewCommentAdded,
  loggedOut = false,
}: CommentsSectionProps) {
  const [state, formAction] = useActionState<CreateCommentActionState, FormData>(
    createComment,
    null,
  );
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTarget>(null);
  const [previewState, setPreviewState] =
    useState<CreateCommentActionState>(null);
  const [visibleComments, setVisibleComments] = useState(comments);
  const [previewGuestRemaining, setPreviewGuestRemaining] = useState(
    participation.guestRemaining,
  );

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) {
      setBody("");
      setReplyTo(null);
    }
  }

  const isGuest = participation.role === "guest";
  const guestRemaining =
    (previewMode ? previewGuestRemaining : participation.guestRemaining) ?? 0;
  const guestBlocked = isGuest && guestRemaining <= 0;
  const activeState = previewMode ? previewState : state;
  const totalCount = visibleComments.reduce(
    (sum, comment) => sum + 1 + comment.replies.length,
    0,
  );

  function handlePreviewSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewMode) {
      return;
    }

    event.preventDefault();
    const trimmedBody = body.trim();
    const fieldError = validateCommentBody(trimmedBody);

    if (fieldError) {
      setPreviewState({ fieldError });
      return;
    }

    const newComment: CommentView = {
      id: `preview-comment-${crypto.randomUUID()}`,
      body: trimmedBody,
      createdAt: new Date().toISOString(),
      authorUsername: "preview_user",
      authorDisplayName: "Preview User",
      replyingTo: replyTo?.username ?? null,
      replies: [],
    };

    if (replyTo) {
      setVisibleComments((current) =>
        current.map((comment) =>
          comment.id === replyTo.commentId
            ? { ...comment, replies: [...comment.replies, newComment] }
            : comment,
        ),
      );
    } else {
      setVisibleComments((current) => [...current, newComment]);
    }

    setBody("");
    setReplyTo(null);
    setPreviewState({ success: true });
    onPreviewCommentAdded?.();

    if (isGuest) {
      setPreviewGuestRemaining((current) => Math.max((current ?? 0) - 1, 0));
    }
  }

  return (
    <section className="mt-2 grid gap-3" id="comments">
      <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-900">
        Comments
        {totalCount > 0 ? (
          <span className="text-sm font-bold text-violet-500">{totalCount}</span>
        ) : null}
      </h2>

      {visibleComments.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-5 text-center text-sm font-medium text-slate-400 ring-1 ring-slate-100">
          No comments yet — be the first voice. 📣
        </p>
      ) : (
        <ul className="grid">
          {visibleComments.map((comment) => (
            <li className="border-b border-slate-100 last:border-0" key={comment.id}>
              <CommentItem
                canReply={!guestBlocked && !loggedOut}
                comment={comment}
                loginPrompt={loggedOut}
                onReply={() =>
                  setReplyTo({
                    commentId: comment.id,
                    username: comment.authorUsername,
                  })
                }
                previewMode={previewMode}
                rating={ratings[comment.id]}
              />
              {comment.replies.length > 0 ? (
                <ul className="mb-2 ml-5 grid border-l-2 border-violet-100 pl-3 sm:ml-6">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem
                        canReply={false}
                        comment={reply}
                        isReply
                        loginPrompt={loggedOut}
                        previewMode={previewMode}
                        rating={ratings[reply.id]}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {loggedOut ? <LoginActionPrompt variant="banner" /> : null}

      {!loggedOut && isGuest && !guestBlocked ? (
        <p
          className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-amber-800 ring-1 ring-amber-200"
          role="status"
        >
          <span aria-hidden className="mt-px">👋</span>
          {guestRemainingMessage(guestRemaining)}
        </p>
      ) : null}

      {loggedOut ? null : guestBlocked ? (
        <p
          className="flex items-start gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-slate-600"
          role="status"
        >
          <span aria-hidden className="mt-px">🔒</span>
          {GUEST_LIMIT_REACHED_MESSAGE}
        </p>
      ) : (
        <form
          action={previewMode ? undefined : formAction}
          className="grid gap-2.5 rounded-2xl border border-violet-900/[0.08] bg-white p-3 shadow-sm shadow-violet-900/[0.03]"
          id="composer"
          noValidate
          onSubmit={handlePreviewSubmit}
        >
          {activeState?.formError ? (
            <p
              className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
              role="alert"
            >
              <span aria-hidden className="mt-px">⚠️</span>
              {activeState.formError}
            </p>
          ) : null}

          {replyTo ? (
            <p className="flex items-center justify-between gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800">
              <span>
                ↩ Replying to <span className="font-bold">@{replyTo.username}</span>
              </span>
              <button
                className="text-xs font-bold text-violet-600 underline-offset-2 hover:underline"
                onClick={() => setReplyTo(null)}
                type="button"
              >
                Cancel
              </button>
            </p>
          ) : null}

          <input name="topicId" type="hidden" value={topicId} />
          <input name="entryId" type="hidden" value={entryId ?? ""} />
          <input
            name="parentCommentId"
            type="hidden"
            value={replyTo?.commentId ?? ""}
          />

          <textarea
            aria-label={replyTo ? "Your reply" : "Add a comment"}
            className="min-h-12 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:min-h-20 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/15"
            maxLength={COMMENT_MAX}
            name="body"
            onChange={(event) => setBody(event.target.value)}
            placeholder={
              replyTo
                ? `Reply to @${replyTo.username}…`
                : "What's your take? Join the discussion…"
            }
            required
            rows={2}
            value={body}
          />
          {activeState?.fieldError ? (
            <p className="flex items-start gap-1.5 text-sm text-rose-600" role="alert">
              <span aria-hidden>⚠️</span>
              {activeState.fieldError}
            </p>
          ) : null}

          {previewMode && activeState?.success ? (
            <p className="text-sm font-semibold text-emerald-700" role="status">
              Comment added to this preview thread.
            </p>
          ) : null}

          <div className="flex justify-end">
            <PostButton replying={Boolean(replyTo)} />
          </div>
        </form>
      )}
    </section>
  );
}

function PostButton({ replying }: { replying: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-full bg-violet-700 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-violet-700/25 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Posting…" : replying ? "Post reply" : "Post comment"}
    </button>
  );
}

function CommentItem({
  comment,
  rating,
  canReply,
  onReply,
  previewMode,
  loginPrompt = false,
  isReply = false,
}: {
  comment: CommentView;
  rating?: { averageScore: number; ratingCount: number; myScore: number | null };
  canReply: boolean;
  onReply?: () => void;
  previewMode: boolean;
  loginPrompt?: boolean;
  isReply?: boolean;
}) {
  const authorName = comment.authorDisplayName ?? comment.authorUsername;

  return (
    <article className="flex gap-2.5 py-3">
      <div className="shrink-0 pt-0.5">
        <ClubAvatar name={authorName} size={isReply ? "sm" : "md"} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-slate-700">
          <span className="font-bold text-slate-900">{authorName}</span>{" "}
          {comment.replyingTo ? (
            <span className="font-semibold text-violet-600">
              @{comment.replyingTo}{" "}
            </span>
          ) : null}
          {comment.body}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs font-semibold text-slate-400">
          <span className="px-1" suppressHydrationWarning>
            {timeAgo(comment.createdAt)}
          </span>
          <RatingWidget
            averageScore={rating?.averageScore ?? 0}
            compact
            loginPrompt={loginPrompt}
            myScore={rating?.myScore ?? null}
            previewMode={previewMode}
            ratingCount={rating?.ratingCount ?? 0}
            targetId={comment.id}
            targetType="comment"
          />
          {canReply && onReply ? (
            <button
              className="rounded-full px-2 py-1 font-bold text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
              onClick={onReply}
              type="button"
            >
              Reply
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
