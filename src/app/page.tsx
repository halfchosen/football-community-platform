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
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

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
  ] =
    await Promise.all([
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
  const activeClubId = hashtagIsFan ? "" : hashtagClub?.id ?? clubParam ?? "";
  const activeClubName = hashtagClub ? "" : clubNameParam ?? "";
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
                : queryParam ?? null,
            scope: activeScope,
            clubId: activeClubId || null,
            clubName: activeClubName || null,
            leagueId: leagueParam ?? null,
          },
          { viewerId: user?.id ?? null, clubs, leagues: [] },
        ),
    focusedTopicId
      ? getFeedTopicById(focusedTopicId)
      : Promise.resolve(null),
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
    <FeedShell searchValue={queryParam ?? ""} sidebar={<FeedRail />}>
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
          <EmptyState icon="🧠" message={QUIZZES_EMPTY_MESSAGE} />
        ) : topics.length === 0 ? (
          <EmptyState
            icon="💬"
            message="No topics match these filters yet — try a different category, or start the conversation."
          />
        ) : (
          <ul className="grid gap-3">
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

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-violet-200 bg-white px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-violet-100 text-xl">
        {icon}
      </span>
      <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-500">
        {message}
      </p>
    </div>
  );
}
