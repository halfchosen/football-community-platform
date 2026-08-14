import { createClient } from "@/lib/supabase/server";
import { GUEST_LIMIT_WINDOW_HOURS } from "@/domains/forum/participation";
import type { RatingTargetType } from "@/domains/forum/comments";
import type {
  ContributionView,
  ReplyView,
} from "@/domains/forum/discussion";

export type { ContributionView, ReplyView } from "@/domains/forum/discussion";

export type RatingSummary = {
  averageScore: number;
  ratingCount: number;
  myScore: number | null;
};

type ContributionRow = {
  id: string;
  topic_id: string;
  body: string;
  is_opening: boolean;
  created_at: string;
  author_username: string;
  author_display_name: string | null;
  author_club_name: string | null;
  author_title_name: string | null;
  author_level: number | null;
};

type ReplyRow = {
  id: string;
  entry_id: string;
  body: string;
  created_at: string;
  author_username: string;
  author_display_name: string | null;
};

/** Opening and later contributions with their direct replies, oldest first. */
export async function listTopicContributions(
  topicId: string,
): Promise<ContributionView[]> {
  const supabase = await createClient();
  const [contributionsResult, repliesResult] = await Promise.all([
    supabase
      .from("forum_entries_with_author")
      .select("*")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: true }),
    supabase
      .from("forum_comments_with_author")
      .select("*")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: true }),
  ]);

  if (contributionsResult.error || !contributionsResult.data) {
    return [];
  }

  const repliesByContribution = new Map<string, ReplyView[]>();

  for (const row of (repliesResult.data ?? []) as unknown as ReplyRow[]) {
    const replies = repliesByContribution.get(row.entry_id) ?? [];
    replies.push({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      authorUsername: row.author_username,
      authorDisplayName: row.author_display_name,
    });
    repliesByContribution.set(row.entry_id, replies);
  }

  return (contributionsResult.data as unknown as ContributionRow[]).map(
    (row) => ({
      id: row.id,
      body: row.body,
      isOpening: row.is_opening,
      createdAt: row.created_at,
      authorUsername: row.author_username,
      authorDisplayName: row.author_display_name,
      authorClubName: row.author_club_name,
      authorTitleName: row.author_title_name,
      authorLevel: row.author_level,
      replies: repliesByContribution.get(row.id) ?? [],
    }),
  );
}

/**
 * Rating summaries (public aggregates) plus the viewer's own scores for a set
 * of targets. Target ids are unique uuids, so one id lookup covers all types.
 */
export async function getRatingSummaries(
  targetIds: string[],
  userId: string | null,
): Promise<Map<string, RatingSummary>> {
  const summaries = new Map<string, RatingSummary>();

  if (targetIds.length === 0) {
    return summaries;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_rating_summaries")
    .select("target_id, average_score, rating_count")
    .in("target_id", targetIds);

  for (const row of (data ?? []) as unknown as {
    target_id: string;
    average_score: number;
    rating_count: number;
  }[]) {
    summaries.set(row.target_id, {
      averageScore: Number(row.average_score),
      ratingCount: row.rating_count,
      myScore: null,
    });
  }

  if (userId) {
    const { data: mine } = await supabase
      .from("forum_ratings")
      .select("target_id, score")
      .eq("user_id", userId)
      .in("target_id", targetIds);

    for (const row of (mine ?? []) as unknown as {
      target_id: string;
      score: number;
    }[]) {
      const existing = summaries.get(row.target_id);

      if (existing) {
        existing.myScore = row.score;
      } else {
        summaries.set(row.target_id, {
          averageScore: row.score,
          ratingCount: 1,
          myScore: row.score,
        });
      }
    }
  }

  return summaries;
}

/** Active contributions+replies by this user on this topic in the last 24h. */
export async function countRecentParticipationByUser(
  topicId: string,
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const windowStart = new Date(
    Date.now() - GUEST_LIMIT_WINDOW_HOURS * 3600 * 1000,
  ).toISOString();

  const [contributionsResult, repliesResult] = await Promise.all([
    supabase
      .from("forum_entries")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topicId)
      .eq("author_id", userId)
      .eq("is_opening", false)
      .eq("status", "active")
      .gte("created_at", windowStart),
    supabase
      .from("forum_comments")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topicId)
      .eq("author_id", userId)
      .eq("status", "active")
      .gte("created_at", windowStart),
  ]);

  return (contributionsResult.count ?? 0) + (repliesResult.count ?? 0);
}

export async function getRatingSummaryForTarget(
  targetType: RatingTargetType,
  targetId: string,
): Promise<{ averageScore: number; ratingCount: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_rating_summaries")
    .select("average_score, rating_count")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  const row = data as unknown as {
    average_score: number;
    rating_count: number;
  } | null;

  return {
    averageScore: row ? Number(row.average_score) : 0,
    ratingCount: row?.rating_count ?? 0,
  };
}
