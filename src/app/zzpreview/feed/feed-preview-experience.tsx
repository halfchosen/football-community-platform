"use client";

import { useMemo, useState } from "react";
import {
  FeedToolbar,
  type FeedFilterState,
  type FeedTeamFilter,
} from "@/components/forum/feed-toolbar";
import { TopicCard } from "@/components/forum/topic-card";
import type { FeedTopic } from "@/lib/db/queries/feed";
import type { ClubOption } from "@/lib/db/queries/clubs";
import { getFeedCategory } from "@/domains/forum/feed";
import type {
  ContributionView,
  TopicContributionsPayload,
} from "@/domains/forum/discussion";
import { demoContributions } from "@/app/zzpreview/_mock/forum";

type FeedPreviewExperienceProps = {
  focusedTopicId?: string | null;
  initialState: FeedFilterState;
  isLoggedIn: boolean;
  primaryClubId: string | null;
  primaryClubName: string | null;
  clubs: ClubOption[];
  teamFilters: FeedTeamFilter[];
  topics: FeedTopic[];
};

export function FeedPreviewExperience({
  focusedTopicId,
  initialState,
  isLoggedIn,
  primaryClubId,
  primaryClubName,
  clubs,
  teamFilters,
  topics,
}: FeedPreviewExperienceProps) {
  const [filters, setFilters] = useState(initialState);
  const visibleTopics = useMemo(() => {
    const filteredTopics = filterTopics(
      topics,
      filters,
      primaryClubId,
      primaryClubName,
      clubs,
    );
    const focusedTopic = focusedTopicId
      ? topics.find((topic) => topic.id === focusedTopicId)
      : null;

    return focusedTopic ? [focusedTopic] : filteredTopics;
  }, [clubs, filters, focusedTopicId, primaryClubId, primaryClubName, topics]);
  const category = getFeedCategory(filters.category);

  return (
    <div className="grid min-w-0 gap-3">
      <FeedToolbar
        {...filters}
        isLoggedIn={isLoggedIn}
        newTopicHref={isLoggedIn ? "/forum/new" : "/login"}
        onPreviewChange={setFilters}
        previewMode
        teamFilters={teamFilters}
      />

      {category.comingSoon ? (
        <PreviewEmpty message="Quizzes are not part of this release yet." />
      ) : visibleTopics.length === 0 ? (
        <PreviewEmpty message="No preview topics match these filters." />
      ) : (
        <ul className="grid gap-3">
          {visibleTopics.map((topic) => (
            <li
              key={`${topic.id}-${topic.id === focusedTopicId ? "focused" : "standard"}`}
            >
              <TopicCard
                authorHref="/zzpreview/profile"
                contributionCount={topic.contributionCount}
                href={`/zzpreview/feed?topic=${encodeURIComponent(topic.id)}`}
                initialExpanded={topic.id === focusedTopicId}
                inlineContributions
                interactionCount={topic.interactionCount}
                previewContent={makePreviewContent(topic, isLoggedIn)}
                ratingAverage={topic.ratingAverage}
                ratingCount={topic.ratingCount}
                topic={topic}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function makePreviewContent(
  topic: FeedTopic,
  isLoggedIn: boolean,
): TopicContributionsPayload {
  const contributions: ContributionView[] = demoContributions.map(
    (contribution, index) => {
      if (index === 0) {
        return {
          ...contribution,
          id: topic.openingEntryId ?? `preview-opening-${topic.id}`,
          body: topic.openingBody,
          createdAt: topic.createdAt,
          authorUsername: topic.authorUsername,
          authorDisplayName: topic.authorDisplayName,
          authorClubName: topic.authorClubName,
          authorTitleName: topic.authorTitleName,
          authorLevel: topic.authorLevel,
        };
      }

      const suffix = topic.id;

      return {
        ...contribution,
        id: `${contribution.id}-${suffix}`,
        replies: contribution.replies.map((reply) => ({
          ...reply,
          id: `${reply.id}-${suffix}`,
        })),
      };
    },
  );

  return {
    contributions,
    ratings: {},
    participation: { role: "guest", guestRemaining: 1 },
    loggedOut: !isLoggedIn,
    viewer: isLoggedIn
      ? { username: "demo_user", displayName: "Demo User" }
      : null,
  };
}

function filterTopics(
  topics: FeedTopic[],
  filters: FeedFilterState,
  primaryClubId: string | null,
  primaryClubName: string | null,
  clubs: ClubOption[],
) {
  const category = getFeedCategory(filters.category);
  const selectedClub = filters.clubId
    ? clubs.find((club) => club.id === filters.clubId)
    : null;
  const scopedClubId =
    filters.scope === "fan" ? primaryClubId : selectedClub?.id ?? null;
  const scopedClubName =
    filters.scope === "fan"
      ? primaryClubName
      : (selectedClub?.name ?? filters.clubName) || null;
  const query = filters.search.trim().replace(/^#/, "").toLowerCase();
  const queryIsResolvedTag =
    filters.search.trim().startsWith("#") &&
    (category.value !== "all" || filters.scope === "fan" || filters.scope === "club");

  return topics.filter((topic) => {
    if (category.topicType && topic.topicType !== category.topicType) {
      return false;
    }

    if (
      (filters.scope === "fan" || filters.scope === "club") &&
      !matchesClub(topic, scopedClubId, scopedClubName)
    ) {
      return false;
    }

    if (query && !queryIsResolvedTag) {
      return topic.title.toLowerCase().includes(query);
    }

    return true;
  });
}

function matchesClub(
  topic: FeedTopic,
  clubId: string | null,
  clubName: string | null,
) {
  return Boolean(
    (clubId && topic.clubId === clubId) ||
      (clubName &&
        topic.clubName &&
        topic.clubName.toLowerCase() === clubName.toLowerCase()),
  );
}

function PreviewEmpty({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-violet-200 bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500">
      {message}
    </p>
  );
}
