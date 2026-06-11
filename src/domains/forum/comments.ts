/** Comment, reply, and rating validation rules (Sprint 2B). */

export const COMMENT_MIN = 2;
export const COMMENT_MAX = 2000;

export const RATING_MIN = 0;
export const RATING_MAX = 10;

export const RATING_TARGET_TYPES = ["topic", "entry", "comment"] as const;
export type RatingTargetType = (typeof RATING_TARGET_TYPES)[number];

export type CreateCommentInput = {
  topicId: string;
  entryId: string | null;
  parentCommentId: string | null;
  body: string;
};

export function parseCreateCommentInput(formData: FormData): CreateCommentInput {
  const entryId = String(formData.get("entryId") ?? "").trim();
  const parentCommentId = String(formData.get("parentCommentId") ?? "").trim();

  return {
    topicId: String(formData.get("topicId") ?? "").trim(),
    entryId: entryId.length > 0 ? entryId : null,
    parentCommentId: parentCommentId.length > 0 ? parentCommentId : null,
    body: String(formData.get("body") ?? "").trim(),
  };
}

export function validateCommentBody(body: string): string | null {
  if (body.length < COMMENT_MIN) {
    return "Write a comment before posting.";
  }

  if (body.length > COMMENT_MAX) {
    return `Comments can be at most ${COMMENT_MAX} characters.`;
  }

  return null;
}

export function isRatingTargetType(value: string): value is RatingTargetType {
  return (RATING_TARGET_TYPES as readonly string[]).includes(value);
}

export function validateRatingScore(score: number): string | null {
  if (!Number.isInteger(score) || score < RATING_MIN || score > RATING_MAX) {
    return `Rating must be a whole number between ${RATING_MIN} and ${RATING_MAX}.`;
  }

  return null;
}
