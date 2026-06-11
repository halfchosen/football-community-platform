import { createClient } from "@/lib/supabase/server";
import { GUEST_LIMIT_WINDOW_HOURS } from "@/domains/forum/participation";
import type { RatingTargetType } from "@/domains/forum/comments";

export type RatingSummary = {
  averageScore: number;
  ratingCount: number;
  myScore: number | null;
};

export type CommentView = {
  id: string;
  body: string;
  createdAt: string;
  authorUsername: string;
  authorDisplayName: string | null;
  /** Username of the parent comment's author (replies only). */
  replyingTo: string | null;
  replies: CommentView[];
};

type CommentRow = {
  id: string;
  topic_id: string;
  entry_id: string | null;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  author_username: string;
  author_display_name: string | null;
};

/** Active comments for a topic as a one-level tree, oldest first. */
export async function listTopicComments(topicId: string): Promise<CommentView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_comments_with_author")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as CommentRow[];
  const byId = new Map<string, CommentView>();
  const topLevel: CommentView[] = [];

  for (const row of rows) {
    if (!row.parent_comment_id) {
      const view: CommentView = {
        id: row.id,
        body: row.body,
        createdAt: row.created_at,
        authorUsername: row.author_username,
        authorDisplayName: row.author_display_name,
        replyingTo: null,
        replies: [],
      };
      byId.set(row.id, view);
      topLevel.push(view);
    }
  }

  for (const row of rows) {
    if (!row.parent_comment_id) {
      continue;
    }

    const parent = byId.get(row.parent_comment_id);

    if (!parent) {
      continue;
    }

    parent.replies.push({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      authorUsername: row.author_username,
      authorDisplayName: row.author_display_name,
      replyingTo: parent.authorUsername,
      replies: [],
    });
  }

  return topLevel;
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

/** Active comments+replies by this user on this topic in the last 24h. */
export async function countRecentCommentsByUser(
  topicId: string,
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const windowStart = new Date(
    Date.now() - GUEST_LIMIT_WINDOW_HOURS * 3600 * 1000,
  ).toISOString();

  const { count, error } = await supabase
    .from("forum_comments")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", topicId)
    .eq("author_id", userId)
    .eq("status", "active")
    .gte("created_at", windowStart);

  if (error || count === null) {
    return 0;
  }

  return count;
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
