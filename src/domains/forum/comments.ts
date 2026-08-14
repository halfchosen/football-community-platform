/** Rating validation rules. Content validation lives in contributions.ts. */

export const RATING_MIN = 0;
export const RATING_MAX = 10;

export const RATING_TARGET_TYPES = ["topic", "entry", "comment"] as const;
export type RatingTargetType = (typeof RATING_TARGET_TYPES)[number];

export function isRatingTargetType(value: string): value is RatingTargetType {
  return (RATING_TARGET_TYPES as readonly string[]).includes(value);
}

export function validateRatingScore(score: number): string | null {
  if (!Number.isInteger(score) || score < RATING_MIN || score > RATING_MAX) {
    return `Rating must be a whole number between ${RATING_MIN} and ${RATING_MAX}.`;
  }

  return null;
}
