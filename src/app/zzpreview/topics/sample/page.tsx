import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { TopicDetail } from "@/components/forum/topic-detail";
import { RatingWidget } from "@/components/forum/rating-widget";
import { ParticipationBadge } from "@/components/forum/participation-badge";
import { CommentsSection } from "@/components/forum/comments-section";
import {
  GUEST_LIMIT_REACHED_MESSAGE,
  guestRemainingMessage,
} from "@/domains/forum/participation";
import {
  demoCommentRatings,
  demoComments,
  demoEntryRating,
  demoTopicRating,
  demoTopicSourced,
} from "@/app/zzpreview/_mock/forum";

// Full thread sample: opening entry, comments, replies, rating widgets,
// source badge/card, participation badge, and the guest-limit states.
// Preview mode: rating clicks update local state only; the comment form
// never posts. Nothing is written to Supabase.
export default function TopicSamplePreviewPage() {
  const topic = demoTopicSourced;

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-3xl gap-8">
        <Link
          className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-900"
          href="/zzpreview/forum"
        >
          ← Back to forum preview
        </Link>

        <TopicDetail
          entryRating={
            <RatingWidget
              averageScore={demoEntryRating.averageScore}
              compact
              myScore={demoEntryRating.myScore}
              previewMode
              ratingCount={demoEntryRating.ratingCount}
              targetId={topic.openingEntryId ?? "preview-entry"}
              targetType="entry"
            />
          }
          participationBadge={<ParticipationBadge role="guest" />}
          topic={topic}
          topicRating={
            <RatingWidget
              averageScore={demoTopicRating.averageScore}
              compact
              myScore={demoTopicRating.myScore}
              previewMode
              ratingCount={demoTopicRating.ratingCount}
              targetId={topic.id}
              targetType="topic"
            />
          }
        />

        <CommentsSection
          comments={demoComments}
          entryId={topic.openingEntryId}
          participation={{ role: "guest", guestRemaining: 1 }}
          previewMode
          ratings={demoCommentRatings}
          topicId={topic.id}
        />

        <section className="grid gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            Guest limit states (reference)
          </p>
          <p className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
            <span aria-hidden className="mt-px">👋</span>
            {guestRemainingMessage(3)}
          </p>
          <p className="flex items-start gap-2.5 rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-600">
            <span aria-hidden className="mt-px">🔒</span>
            {GUEST_LIMIT_REACHED_MESSAGE}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
            Participation badges:
            <ParticipationBadge role="fan" />
            <ParticipationBadge role="following" />
            <ParticipationBadge role="guest" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
