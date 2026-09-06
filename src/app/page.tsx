import { ContextRail } from "@/components/community/context-rail";
import { FeedShell } from "@/components/layout/feed-shell";
import { FeedRail } from "@/components/forum/feed-rail";
import {
  FeedToolbar,
  type FeedTeamFilter,
} from "@/components/forum/feed-toolbar";
import { TopicCard } from "@/components/forum/topic-card";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { getCurrentClubOptions } from "@/lib/db/queries/clubs";
import { getFeedTopicById, getFeedTopics } from "@/lib/db/queries/feed";
import {
  getOwnProfileSummary,
  getSecondaryClubIdentities,
} from "@/lib/db/queries/profiles";
import {
  getFeedCategoryByTag,
  getFeedHashtag,
  getFeedCategory,
  QUIZZES_EMPTY_MESSAGE,
  toFeedTag,
  type FeedScope,
} from "@/domains/forum/feed";
import {
  getSearchParam,
  type PageSearchParams,
} from "@/lib/utils/search-params";
import { EmptyState } from "@/components/ui/status-notice";
import { BallIcon, PitchIcon } from "@/components/ui/icons";

type HomePageProps = {
  searchParams: PageSearchParams;
};

const SCOPES: FeedScope[] = ["all", "fan", "likes", "club", "league"];

// Public community feed: browse, search, and read without logging in.
// Publishing and rating prompt for login instead.
export default async function Home({ searchParams }: HomePageProps) {
  const user = await getAuthenticatedUser();

  const [
    typeParam,
    scopeParam,
    clubParam,
    clubNameParam,
    leagueParam,
    queryParam,
    focusedTopicId,
  ] = await Promise.all([
    getSearchParam(searchParams, "type"),
    getSearchParam(searchParams, "scope"),
    getSearchParam(searchParams, "club"),
    getSearchParam(searchParams, "team"),
    getSearchParam(searchParams, "league"),
    getSearchParam(searchParams, "q"),
    getSearchParam(searchParams, "topic"),
  ]);

  const requestedScope = SCOPES.includes(scopeParam as FeedScope)
    ? (scopeParam as FeedScope)
    : "all";
  const scope: FeedScope =
    !user && (requestedScope === "fan" || requestedScope === "likes")
      ? "all"
      : requestedScope;

  const [clubs, profile, secondaryClubs] = await Promise.all([
    getCurrentClubOptions(),
    user ? getOwnProfileSummary(user.id) : Promise.resolve(null),
    user ? getSecondaryClubIdentities(user.id) : Promise.resolve([]),
  ]);

  const hashtag = getFeedHashtag(queryParam);
  const hashtagCategory = getFeedCategoryByTag(hashtag);
  const hashtagClub =
    hashtag && !hashtagCategory
      ? clubs.find((club) => toFeedTag(club.name) === `#${hashtag}`)
      : undefined;
  const category = hashtagCategory ?? getFeedCategory(typeParam);
  const hashtagIsFan = Boolean(
    hashtagClub &&
      profile &&
      (profile.primaryClubId === hashtagClub.id ||
        (profile.primaryClubName &&
          toFeedTag(profile.primaryClubName) === toFeedTag(hashtagClub.name))),
  );
  const activeScope: FeedScope = hashtagIsFan
    ? "fan"
    : hashtagClub
      ? "club"
      : scope;
  const activeClubId = hashtagIsFan ? "" : (hashtagClub?.id ?? clubParam ?? "");
  const activeClubName = hashtagClub ? "" : (clubNameParam ?? "");
  const activeCatalogClub =
    hashtagClub ??
    (activeScope === "club" && activeClubId
      ? clubs.find((club) => club.id === activeClubId)
      : undefined);

  const teamFilters: FeedTeamFilter[] = [
    ...(profile?.primaryClubName
      ? [
          {
            id: "fan",
            label: toFeedTag(profile.primaryClubName),
            scope: "fan" as const,
          },
        ]
      : []),
    ...secondaryClubs.map((club) => ({
      id: club.clubId ?? club.clubSuggestionId ?? club.displayName,
      label: toFeedTag(club.displayName),
      scope: "club" as const,
      clubId: club.clubId ?? undefined,
      clubName: club.clubId ? undefined : club.displayName,
    })),
    ...(activeCatalogClub &&
    !secondaryClubs.some((club) => club.clubId === activeCatalogClub.id) &&
    profile?.primaryClubId !== activeCatalogClub.id
      ? [
          {
            id: `search-${activeCatalogClub.id}`,
            label: toFeedTag(activeCatalogClub.name),
            scope: "club" as const,
            clubId: activeCatalogClub.id,
          },
        ]
      : activeScope === "club" && activeClubName
        ? [
            {
              id: `search-${activeClubName}`,
              label: toFeedTag(activeClubName),
              scope: "club" as const,
              clubName: activeClubName,
            },
          ]
        : []),
  ];

  const hashtagResolved = Boolean(hashtagCategory || hashtagClub);

  const [filteredTopics, focusedTopic] = await Promise.all([
    category.comingSoon
      ? Promise.resolve([])
      : getFeedTopics(
          {
            topicType: category.topicType,
            titleSearch: hashtagResolved
              ? null
              : hashtag
                ? hashtag
                : (queryParam ?? null),
            scope: activeScope,
            clubId: activeClubId || null,
            clubName: activeClubName || null,
            leagueId: leagueParam ?? null,
          },
          { viewerId: user?.id ?? null, clubs, leagues: [] },
        ),
    focusedTopicId ? getFeedTopicById(focusedTopicId) : Promise.resolve(null),
  ]);
  // A focused topic owns the feed surface until the viewer chooses the logo,
  // search, or a filter. Those controls intentionally omit ?topic= and return
  // the feed to its compact browsing state.
  const topics = focusedTopicId
    ? focusedTopic
      ? [focusedTopic]
      : []
    : filteredTopics;

  return (
    <FeedShell
      searchValue={queryParam ?? ""}
      sidebar={<FeedRail activeTopicId={focusedTopicId} />}
      context={<ContextRail topic={focusedTopic} signedIn={Boolean(user)} />}
    >
      <div className="grid min-w-0 gap-3">
        <FeedToolbar
          category={category.value}
          clubId={activeClubId}
          clubName={activeClubName}
          isLoggedIn={Boolean(user)}
          scope={activeScope}
          search={queryParam ?? ""}
          teamFilters={teamFilters}
        />

        {category.comingSoon ? (
          <EmptyState icon={<PitchIcon size={17} />} title="Not kicked off yet">
            {QUIZZES_EMPTY_MESSAGE}
          </EmptyState>
        ) : topics.length === 0 ? (
          <EmptyState
            icon={<BallIcon size={17} />}
            title="Nothing here yet"
            action={{ href: "/forum/new", label: "Start a topic" }}
          >
            No takes match these filters. Change the angle, or be the first to
            put one out there.
          </EmptyState>
        ) : (
          <ul className={focusedTopicId ? "grid gap-3" : "feed-stream"}>
            {topics.map((topic) => (
              <li
                key={`${topic.id}-${topic.id === focusedTopicId ? "focused" : "standard"}`}
              >
                <TopicCard
                  contributionCount={topic.contributionCount}
                  initialExpanded={topic.id === focusedTopicId}
                  inlineContributions
                  interactionCount={topic.interactionCount}
                  ratingAverage={topic.ratingAverage}
                  ratingCount={topic.ratingCount}
                  topic={topic}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </FeedShell>
  );
}
