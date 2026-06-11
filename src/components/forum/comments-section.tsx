"use client";

import { useActionState, useState, type FormEvent } from "react";
import {
  createComment,
  type CreateCommentActionState,
} from "@/server/actions/forum/create-comment";
import {
  GUEST_LIMIT_REACHED_MESSAGE,
  guestRemainingMessage,
  type ParticipationRole,
} from "@/domains/forum/participation";
import { COMMENT_MAX } from "@/domains/forum/comments";
import type { CommentView } from "@/lib/db/queries/forum";
import { inputClassName } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { RatingWidget } from "@/components/forum/rating-widget";
import { formatTopicDate } from "@/components/forum/topic-card";

export type CommentRatingMap = Record<
  string,
  { averageScore: number; ratingCount: number; myScore: number | null }
>;

type CommentsSectionProps = {
  topicId: string;
  entryId: string | null;
  comments: CommentView[];
  ratings: CommentRatingMap;
  participation: { role: ParticipationRole; guestRemaining: number | null };
  /** Preview hub: render everything but never call the server. */
  previewMode?: boolean;
};

type ReplyTarget = { commentId: string; username: string } | null;

export function CommentsSection({
  topicId,
  entryId,
  comments,
  ratings,
  participation,
  previewMode = false,
}: CommentsSectionProps) {
  const [state, formAction] = useActionState<CreateCommentActionState, FormData>(
    createComment,
    null,
  );
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTarget>(null);

  // Clear the form after a successful post (state-during-render adjustment).
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);

    if (state?.success) {
      setBody("");
      setReplyTo(null);
    }
  }

  const isGuest = participation.role === "guest";
  const guestRemaining = participation.guestRemaining ?? 0;
  const guestBlocked = isGuest && guestRemaining <= 0;
  const totalCount = comments.reduce(
    (sum, comment) => sum + 1 + comment.replies.length,
    0,
  );

  function handlePreviewSubmit(event: FormEvent<HTMLFormElement>) {
    if (previewMode) {
      event.preventDefault();
    }
  }

  return (
    <section className="grid gap-5">
      <h2 className="font-serif text-2xl font-bold text-stone-950">
        Comments{totalCount > 0 ? ` (${totalCount})` : ""}
      </h2>

      {comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 px-4 py-6 text-center text-sm text-stone-500">
          No comments yet — share your take below.
        </p>
      ) : (
        <ul className="grid gap-4">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                canReply={!guestBlocked}
                comment={comment}
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
                <ul className="mt-3 grid gap-3 border-l-2 border-stone-200 pl-4 sm:pl-6">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem
                        canReply={false}
                        comment={reply}
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

      {isGuest && !guestBlocked ? (
        <p
          className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
          role="status"
        >
          <span aria-hidden className="mt-px">👋</span>
          {guestRemainingMessage(guestRemaining)}
        </p>
      ) : null}

      {guestBlocked ? (
        <p
          className="flex items-start gap-2.5 rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-600"
          role="status"
        >
          <span aria-hidden className="mt-px">🔒</span>
          {GUEST_LIMIT_REACHED_MESSAGE}
        </p>
      ) : (
        <form
          action={previewMode ? undefined : formAction}
          className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          noValidate
          onSubmit={handlePreviewSubmit}
        >
          {state?.formError ? <FormMessage error={state.formError} /> : null}

          {replyTo ? (
            <p className="flex items-center justify-between gap-2 rounded-lg bg-emerald-700/10 px-3 py-2 text-sm text-emerald-900">
              <span>
                Replying to <span className="font-semibold">@{replyTo.username}</span>
              </span>
              <button
                className="text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline"
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

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            {replyTo ? "Your reply" : "Add a comment"}
            <textarea
              className={`${inputClassName} min-h-24 resize-y py-3 leading-relaxed`}
              maxLength={COMMENT_MAX}
              name="body"
              onChange={(event) => setBody(event.target.value)}
              placeholder={
                replyTo ? `Reply to @${replyTo.username}…` : "Share your take…"
              }
              required
              rows={3}
              value={body}
            />
          </label>
          {state?.fieldError ? (
            <p className="flex items-start gap-1.5 text-sm text-red-700" role="alert">
              <span aria-hidden>⚠️</span>
              {state.fieldError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <SubmitButton pendingLabel="Posting…">
              {replyTo ? "Post reply" : "Post comment"}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  rating,
  canReply,
  onReply,
  previewMode,
}: {
  comment: CommentView;
  rating?: { averageScore: number; ratingCount: number; myScore: number | null };
  canReply: boolean;
  onReply?: () => void;
  previewMode: boolean;
}) {
  const authorName = comment.authorDisplayName ?? comment.authorUsername;

  return (
    <article className="grid gap-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-stone-400">
        <span className="font-semibold text-stone-700">{authorName}</span>{" "}
        · @{comment.authorUsername} · {formatTopicDate(comment.createdAt)}
        {comment.replyingTo ? (
          <span className="text-emerald-800"> · ↳ replying to @{comment.replyingTo}</span>
        ) : null}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-stone-800">
        {comment.body}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RatingWidget
          averageScore={rating?.averageScore ?? 0}
          compact
          myScore={rating?.myScore ?? null}
          previewMode={previewMode}
          ratingCount={rating?.ratingCount ?? 0}
          targetId={comment.id}
          targetType="comment"
        />
        {canReply && onReply ? (
          <button
            className="text-xs font-semibold text-emerald-800 transition hover:text-emerald-900"
            onClick={onReply}
            type="button"
          >
            ↩ Reply
          </button>
        ) : null}
      </div>
    </article>
  );
}
