import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedShell } from "@/components/layout/feed-shell";
import { FeedRail } from "@/components/forum/feed-rail";
import { TopicDetail } from "@/components/forum/topic-detail";
import { RatingWidget } from "@/components/forum/rating-widget";
import { ParticipationBadge } from "@/components/forum/participation-badge";
import {
  CommentsSection,
  type CommentRatingMap,
} from "@/components/forum/comments-section";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { getTopicById } from "@/lib/db/queries/topics";
import { getRatingSummaries, listTopicComments } from "@/lib/db/queries/forum";
import { classifyParticipation } from "@/server/services/forum-participation";

type TopicPageProps = {
  params: Promise<{ topicId: string }>;
};

// Readable without login; commenting/rating prompt for login instead.
export default async function TopicPage({ params }: TopicPageProps) {
  const user = await getAuthenticatedUser();
  const { topicId } = await params;
  const topic = await getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  const [comments, participation] = await Promise.all([
    listTopicComments(topic.id),
    user ? classifyParticipation(topic, user.id) : Promise.resolve(null),
  ]);

  const commentIds = comments.flatMap((comment) => [
    comment.id,
    ...comment.replies.map((reply) => reply.id),
  ]);
  const ratingTargets = [
    topic.id,
    ...(topic.openingEntryId ? [topic.openingEntryId] : []),
    ...commentIds,
  ];
  const summaries = await getRatingSummaries(ratingTargets, user?.id ?? null);

  const ratingFor = (id: string) =>
    summaries.get(id) ?? { averageScore: 0, ratingCount: 0, myScore: null };

  const topicRating = ratingFor(topic.id);
  const entryRating = topic.openingEntryId
    ? ratingFor(topic.openingEntryId)
    : null;
  const commentRatings: CommentRatingMap = Object.fromEntries(
    commentIds.map((id) => [id, ratingFor(id)]),
  );
  const loggedOut = !user;

  return (
    <FeedShell sidebar={<FeedRail />}>
      <div className="grid gap-4">
        <Link
          className="text-sm font-bold text-slate-400 transition hover:text-violet-600"
          href="/"
        >
          ← Back to feed
        </Link>
        <TopicDetail
          commentHref={loggedOut ? "#comments" : "#composer"}
          entryRating={
            topic.openingEntryId && entryRating ? (
              <RatingWidget
                averageScore={entryRating.averageScore}
                compact
                loginPrompt={loggedOut}
                myScore={entryRating.myScore}
                ratingCount={entryRating.ratingCount}
                targetId={topic.openingEntryId}
                targetType="entry"
              />
            ) : null
          }
          commentCount={commentIds.length}
          participationBadge={
            participation ? <ParticipationBadge role={participation.role} /> : null
          }
          topic={topic}
          topicRating={
            <RatingWidget
              averageScore={topicRating.averageScore}
              compact
              loginPrompt={loggedOut}
              myScore={topicRating.myScore}
              ratingCount={topicRating.ratingCount}
              targetId={topic.id}
              targetType="topic"
            />
          }
        />
        <CommentsSection
          comments={comments}
          entryId={topic.openingEntryId}
          loggedOut={loggedOut}
          participation={participation ?? undefined}
          ratings={commentRatings}
          topicId={topic.id}
        />
      </div>
    </FeedShell>
  );
}
