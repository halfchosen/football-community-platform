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

export function TopicPreviewExperience({ loggedOut }: { loggedOut: boolean }) {
  const topic = demoTopicSourced;
  const [commentCount, setCommentCount] = useState(3);

  return (
    <>
      <TopicDetail
        authorProfileHref="/zzpreview/profile"
        commentCount={commentCount}
        entryRating={
          <RatingWidget
            averageScore={demoEntryRating.averageScore}
            compact
            loginPrompt={loggedOut}
            myScore={demoEntryRating.myScore}
            previewMode
            ratingCount={demoEntryRating.ratingCount}
            targetId={topic.openingEntryId ?? "preview-entry"}
            targetType="entry"
          />
        }
        participationBadge={
          loggedOut ? null : <ParticipationBadge role="guest" />
        }
        topic={topic}
        topicRating={
          <RatingWidget
            averageScore={demoTopicRating.averageScore}
            compact
            loginPrompt={loggedOut}
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
        loggedOut={loggedOut}
        onPreviewCommentAdded={() => setCommentCount((current) => current + 1)}
        participation={{ role: "guest", guestRemaining: 1 }}
        previewMode
        previewProfileHref="/zzpreview/profile"
        ratings={demoCommentRatings}
        topicId={topic.id}
      />
    </>
  );
}
