import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TopicDetail } from "@/components/forum/topic-detail";
import { RatingWidget } from "@/components/forum/rating-widget";
import { ParticipationBadge } from "@/components/forum/participation-badge";
import {
  CommentsSection,
  type CommentRatingMap,
} from "@/components/forum/comments-section";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getTopicById } from "@/lib/db/queries/topics";
import {
  getRatingSummaries,
  listTopicComments,
} from "@/lib/db/queries/forum";
import { classifyParticipation } from "@/server/services/forum-participation";

type TopicPageProps = {
  params: Promise<{ topicId: string }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { user } = await requireOnboardingComplete();
  const { topicId } = await params;
  const topic = await getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  const [comments, participation] = await Promise.all([
    listTopicComments(topic.id),
    classifyParticipation(topic, user.id),
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
  const summaries = await getRatingSummaries(ratingTargets, user.id);

  const ratingFor = (id: string) =>
    summaries.get(id) ?? { averageScore: 0, ratingCount: 0, myScore: null };

  const topicRating = ratingFor(topic.id);
  const entryRating = topic.openingEntryId
    ? ratingFor(topic.openingEntryId)
    : null;
  const commentRatings: CommentRatingMap = Object.fromEntries(
    commentIds.map((id) => [id, ratingFor(id)]),
  );

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-3xl gap-8">
        <Link
          className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-900"
          href="/forum"
        >
          ← Back to forum
        </Link>
        <TopicDetail
          entryRating={
            topic.openingEntryId && entryRating ? (
              <RatingWidget
                averageScore={entryRating.averageScore}
                compact
                myScore={entryRating.myScore}
                ratingCount={entryRating.ratingCount}
                targetId={topic.openingEntryId}
                targetType="entry"
              />
            ) : null
          }
          participationBadge={<ParticipationBadge role={participation.role} />}
          topic={topic}
          topicRating={
            <RatingWidget
              averageScore={topicRating.averageScore}
              compact
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
          participation={participation}
          ratings={commentRatings}
          topicId={topic.id}
        />
      </div>
    </AppShell>
  );
}
