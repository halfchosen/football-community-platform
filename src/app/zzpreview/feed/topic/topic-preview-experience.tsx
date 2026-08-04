"use client";

import { useState } from "react";
import { TopicDetail } from "@/components/forum/topic-detail";
import { RatingWidget } from "@/components/forum/rating-widget";
import { ParticipationBadge } from "@/components/forum/participation-badge";
import { CommentsSection } from "@/components/forum/comments-section";
import {
  demoCommentRatings,
  demoComments,
  demoEntryRating,
  demoTopicRating,
  demoTopicSourced,
} from "@/app/zzpreview/_mock/forum";

export function TopicPreviewExperience() {
  const topic = demoTopicSourced;
  const [commentCount, setCommentCount] = useState(3);

  return (
    <>
      <TopicDetail
        commentCount={commentCount}
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
        onPreviewCommentAdded={() => setCommentCount((current) => current + 1)}
        participation={{ role: "guest", guestRemaining: 1 }}
        previewMode
        ratings={demoCommentRatings}
        topicId={topic.id}
      />
    </>
  );
}
