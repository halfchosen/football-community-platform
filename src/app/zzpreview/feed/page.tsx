import { FeedShell } from "@/components/layout/feed-shell";
import { TopicSidebar } from "@/components/forum/topic-sidebar";
import type {
  FeedFilterState,
  FeedTeamFilter,
} from "@/components/forum/feed-toolbar";
import { FeedPreviewExperience } from "@/app/zzpreview/feed/feed-preview-experience";
import {
  demoFeedTopics,
  demoSidebarItems,
} from "@/app/zzpreview/_mock/forum";
import {
  demoProfile,
  demoSecondaryClubs,
  previewClubs,
} from "@/app/zzpreview/_mock/data";
import {
  getFeedCategoryByTag,
  getFeedHashtag,
  toFeedTag,
} from "@/domains/forum/feed";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";
import { getAuthenticatedUser } from "@/lib/auth/guards";

type FeedPreviewPageProps = {
  searchParams: PageSearchParams;
};

// Preview of the final content-first feed. Controls update locally and nothing
// writes; the sidebar is intentionally Trending-only.
export default async function FeedPreviewPage({
  searchParams,
}: FeedPreviewPageProps) {
  const query = (await getSearchParam(searchParams, "q")) ?? "";
  const user = await getAuthenticatedUser();
  const teamFilters: FeedTeamFilter[] = [
    {
      id: "fan",
      label: toFeedTag(demoProfile.primaryClubName ?? "club"),
      scope: "fan" as const,
    },
    ...demoSecondaryClubs.map((club) => ({
      id: club.clubId ?? club.displayName,
      label: toFeedTag(club.displayName),
      scope: "club" as const,
      clubId: club.clubId ?? undefined,
      clubName: club.clubId ? undefined : club.displayName,
    })),
  ];
  const hashtag = getFeedHashtag(query);
  const hashtagCategory = getFeedCategoryByTag(hashtag);
  const hashtagTeam = hashtag
    ? teamFilters.find((team) => team.label === `#${hashtag}`)
    : undefined;
  const initialState: FeedFilterState = {
    category: hashtagCategory?.value ?? "all",
    scope: hashtagTeam?.scope ?? "all",
    clubId: hashtagTeam?.clubId ?? "",
    clubName: hashtagTeam?.clubName ?? "",
    search: query,
  };

  return (
    <FeedShell
      searchAction="/zzpreview/feed"
      searchValue={query}
      sidebar={<TopicSidebar items={demoSidebarItems} variant="rail" />}
    >
      <FeedPreviewExperience
        clubs={previewClubs}
        initialState={initialState}
        isLoggedIn={Boolean(user)}
        primaryClubId={demoProfile.primaryClubId}
        primaryClubName={demoProfile.primaryClubName}
        teamFilters={teamFilters}
        topics={demoFeedTopics}
      />
    </FeedShell>
  );
}
