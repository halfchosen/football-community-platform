import { createClient } from "@/lib/supabase/server";
import {
  listTopicsFiltered,
  type TopicListItem,
} from "@/lib/db/queries/topics";
import { getRatingSummaries } from "@/lib/db/queries/forum";
import {
  getOwnProfileSummary,
  getSecondaryClubIdentities,
} from "@/lib/db/queries/profiles";
import type { FeedScope } from "@/domains/forum/feed";
import type { ClubOption, LeagueOption } from "@/lib/db/queries/clubs";

export type FeedTopic = TopicListItem & {
  ratingAverage: number;
  ratingCount: number;
  commentCount: number;
};

export type FeedFilters = {
  topicType?: string | null;
  titleSearch?: string | null;
  scope?: FeedScope;
  /** Catalog club id (?club=) when scope is "club". */
  clubId?: string | null;
  /** Fallback identity name (?team=) when a selected club is not catalogued. */
  clubName?: string | null;
  /** Catalog league id (?league=) when scope is "league". */
  leagueId?: string | null;
};

type FeedContext = {
  viewerId: string | null;
  clubs: ClubOption[];
  leagues: LeagueOption[];
};

const FEED_FETCH_LIMIT = 100;
const FEED_PAGE_SIZE = 30;

/**
 * Topics for the public feed: type/title filters hit the database; identity
 * scope (FAN club / liked teams / specific club / league) is applied here by
 * matching the topic's club id or name snapshot against the catalog, so both
 * database clubs and fallback-catalog clubs are covered.
 */
export async function getFeedTopics(
  filters: FeedFilters,
  context: FeedContext,
): Promise<FeedTopic[]> {
  const topics = await listTopicsFiltered({
    topicType: filters.topicType,
    titleSearch: filters.titleSearch,
    limit: FEED_FETCH_LIMIT,
  });

  const scoped = await applyScope(topics, filters, context);
  const page = scoped.slice(0, FEED_PAGE_SIZE);

  return enrichTopics(page);
}

/**
 * Engagement-ranked topics for the Trending rail.
 *
 * We score a wider recent candidate window instead of calling the newest
 * topics "trending". Comments lead the signal, ratings add supporting weight,
 * and a gentle time decay keeps the rail moving without erasing an active
 * discussion the moment a newer topic appears.
 */
export async function getTrendingTopics(limit = 8): Promise<FeedTopic[]> {
  const candidateLimit = Math.max(limit * 5, 60);
  const topics = await listTopicsFiltered({ limit: candidateLimit });
  const enriched = await enrichTopics(topics);

  return enriched
    .sort((left, right) => {
      const scoreDifference = trendingScore(right) - trendingScore(left);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    })
    .slice(0, limit);
}

async function applyScope(
  topics: TopicListItem[],
  filters: FeedFilters,
  context: FeedContext,
): Promise<TopicListItem[]> {
  const scope = filters.scope ?? "all";

  if (scope === "all") {
    return topics;
  }

  if (scope === "club" && filters.clubId) {
    const club = context.clubs.find((entry) => entry.id === filters.clubId);

    if (!club) {
      return topics;
    }

    return topics.filter((topic) => matchesClub(topic, club.id, club.name));
  }

  if (scope === "club" && filters.clubName) {
    return topics.filter((topic) =>
      matchesClub(topic, null, filters.clubName ?? null),
    );
  }

  if (scope === "league" && filters.leagueId) {
    const leagueClubs = context.clubs.filter(
      (entry) => entry.leagueId === filters.leagueId,
    );

    return topics.filter((topic) =>
      leagueClubs.some((club) => matchesClub(topic, club.id, club.name)),
    );
  }

  if ((scope === "fan" || scope === "likes") && context.viewerId) {
    const [profile, secondaryClubs] = await Promise.all([
      getOwnProfileSummary(context.viewerId),
      getSecondaryClubIdentities(context.viewerId),
    ]);

    if (scope === "fan") {
      if (!profile?.primaryClubId && !profile?.primaryClubName) {
        return [];
      }

      return topics.filter((topic) =>
        matchesClub(topic, profile.primaryClubId, profile.primaryClubName),
      );
    }

    if (secondaryClubs.length === 0) {
      return [];
    }

    return topics.filter((topic) =>
      secondaryClubs.some((club) =>
        matchesClub(topic, club.clubId, club.displayName),
      ),
    );
  }

  return topics;
}

function matchesClub(
  topic: { clubId: string | null; clubName: string | null },
  clubId: string | null,
  clubName: string | null,
) {
  if (clubId && topic.clubId === clubId) {
    return true;
  }

  return Boolean(
    clubName &&
      topic.clubName &&
      topic.clubName.toLowerCase() === clubName.toLowerCase(),
  );
}

async function enrichTopics(topics: TopicListItem[]): Promise<FeedTopic[]> {
  if (topics.length === 0) {
    return [];
  }

  const topicIds = topics.map((topic) => topic.id);
  const [summaries, commentCounts] = await Promise.all([
    getRatingSummaries(topicIds, null),
    countCommentsByTopic(topicIds),
  ]);

  return topics.map((topic) => {
    const summary = summaries.get(topic.id);

    return {
      ...topic,
      ratingAverage: summary?.averageScore ?? 0,
      ratingCount: summary?.ratingCount ?? 0,
      commentCount: commentCounts.get(topic.id) ?? 0,
    };
  });
}

function trendingScore(topic: FeedTopic): number {
  const createdAt = Date.parse(topic.createdAt);
  const ageHours = Number.isFinite(createdAt)
    ? Math.max((Date.now() - createdAt) / 3_600_000, 0)
    : 0;
  const engagement =
    topic.commentCount * 3 +
    topic.ratingCount * 1.5 +
    topic.ratingAverage;

  return engagement / Math.pow(ageHours + 2, 0.65);
}

async function countCommentsByTopic(
  topicIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_comments")
    .select("topic_id")
    .eq("status", "active")
    .in("topic_id", topicIds);

  if (error || !data) {
    return counts;
  }

  for (const row of data as unknown as { topic_id: string }[]) {
    counts.set(row.topic_id, (counts.get(row.topic_id) ?? 0) + 1);
  }

  return counts;
}
