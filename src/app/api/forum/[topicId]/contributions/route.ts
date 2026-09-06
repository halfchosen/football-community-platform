import { createClient } from "@/lib/supabase/server";
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
export async function GET(request: Request, { params }: RouteContext) {
  const { topicId } = await params;
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      topicId,
    )
  )
    return Response.json({ error: "Invalid topic." }, { status: 400 });
  const topic = await getTopicById(topicId);

  if (!topic) {
    return Response.json(
      { error: "This topic no longer exists." },
      { status: 404 },
    );
  }

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("forum_entries")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", topic.id);
  if (countError)
    return Response.json(
      { error: "Posts could not be loaded." },
      { status: 503 },
    );
  const requestedPage = Number(new URL(request.url).searchParams.get("page"));
  const lastPage = Math.max(0, Math.ceil((count ?? 0) / 30) - 1);
  const page =
    new URL(request.url).searchParams.get("page") === "last"
      ? lastPage
      : Number.isFinite(requestedPage)
        ? Math.max(0, Math.min(lastPage, Math.floor(requestedPage)))
        : 0;
  const user = await getAuthenticatedUser();
  const [contributions, participation, profile] = await Promise.all([
    listTopicContributions(topic.id, page * 30),
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

  const { data: saved } = user
    ? await supabase
        .from("saved_topics")
        .select("topic_id")
        .eq("user_id", user.id)
        .eq("topic_id", topic.id)
        .maybeSingle()
    : { data: null };

  const payload: TopicContributionsPayload = {
    page,
    totalPosts: count ?? 0,
    quotaDay: new Date().toISOString().slice(0, 10),
    saved: Boolean(saved),
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
