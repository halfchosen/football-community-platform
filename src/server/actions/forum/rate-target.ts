"use server";

import { requireOnboardingComplete } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  isRatingTargetType,
  validateRatingScore,
} from "@/domains/forum/comments";
import { getRatingSummaryForTarget } from "@/lib/db/queries/forum";

export type RateTargetResult =
  | {
      ok: true;
      averageScore: number;
      ratingCount: number;
      myScore: number;
    }
  | { ok: false; error: string };

/** Upserts the caller's 0-10 rating for a topic/entry/comment. */
export async function rateTarget(
  targetType: string,
  targetId: string,
  score: number,
): Promise<RateTargetResult> {
  const { user } = await requireOnboardingComplete();

  if (!isRatingTargetType(targetType) || !targetId) {
    return { ok: false, error: "Unknown rating target." };
  }

  const scoreError = validateRatingScore(score);

  if (scoreError) {
    return { ok: false, error: scoreError };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("forum_ratings").upsert(
    {
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      score,
    },
    { onConflict: "user_id,target_type,target_id" },
  );

  if (error) {
    if (
      error.message.includes("forum_ratings") &&
      (error.message.includes("schema cache") ||
        error.message.includes("does not exist"))
    ) {
      return {
        ok: false,
        error:
          "Ratings are not set up on this database yet. Run the Sprint 2B migration.",
      };
    }

    return { ok: false, error: error.message };
  }

  const summary = await getRatingSummaryForTarget(targetType, targetId);

  return {
    ok: true,
    averageScore: summary.averageScore,
    ratingCount: summary.ratingCount,
    myScore: score,
  };
}
