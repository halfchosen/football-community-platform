import { getAuthenticatedUser } from "@/lib/auth/guards";
import {
  getRatingSummaries,
  listTopicContributions,
} from "@/lib/db/queries/forum";
import { getOwnProfileSummary } from "@/lib/db/queries/profiles";
import { getTopicById } from "@/lib/db/queries/topics";
import type {
  ContentRatingMap,
  TopicContributionsPayload,
} from "@/domains/forum/discussion";
import { classifyParticipation } from "@/server/services/forum-participation";

type RouteContext = {
  params: Promise<{ topicId: string }>;
};

/** Lazy contribution payload used by expandable feed cards. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { topicId } = await params;
  const topic = await getTopicById(topicId);

  if (!topic) {
    return Response.json(
      { error: "This topic no longer exists." },
      { status: 404 },
    );
  }

  const user = await getAuthenticatedUser();
  const [contributions, participation, profile] = await Promise.all([
    listTopicContributions(topic.id),
    user ? classifyParticipation(topic, user.id) : Promise.resolve(null),
    user ? getOwnProfileSummary(user.id) : Promise.resolve(null),
  ]);
  const targetIds = contributions.flatMap((contribution) => [
    contribution.id,
    ...contribution.replies.map((reply) => reply.id),
  ]);
  const summaries = await getRatingSummaries(targetIds, user?.id ?? null);
  const ratings: ContentRatingMap = Object.fromEntries(
    targetIds.map((id) => [
      id,
      summaries.get(id) ?? {
        averageScore: 0,
        ratingCount: 0,
        myScore: null,
      },
    ]),
  );
  const payload: TopicContributionsPayload = {
    contributions,
    ratings,
    participation: participation ?? undefined,
    loggedOut: !user,
    viewer: profile
      ? { username: profile.username, displayName: profile.displayName }
      : null,
  };

  return Response.json(payload, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
