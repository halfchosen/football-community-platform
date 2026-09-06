import type { TopicListItem } from "@/lib/db/queries/topics";
import type {
  ContentRatingMap,
  ContributionView,
} from "@/domains/forum/discussion";

// Demo forum data for the preview hub: one topic per source-badge state,
// plus a full topic stream (opening contribution, later contributions,
// replies, and ratings).

export const demoTopicSourced: TopicListItem = {
  id: "preview-sourced",
  topicType: "transfer",
  title: "Juventus reportedly agree personal terms with young midfielder",
  sourceUrl: "https://www.juventus.com/en/",
  sourceDomain: "juventus.com",
  sourceTitle: "Example link to the club website",
  clubId: null,
  clubName: "Juventus",
  createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  openingEntryId: "preview-entry-1",
  openingBody:
    "If this goes through it fixes our biggest gap since last summer. The fee sounds high, but compare it with what mid-table Premier League clubs paid for similar profiles this window — it's actually reasonable. My only worry is squad registration before the deadline.",
  authorUsername: "demo_user",
  authorDisplayName: "Demo User",
  authorClubName: "Juventus",
  authorTitleName: "Supporter",
  authorLevel: 1,
};

export const demoTopicUnsourcedClaim: TopicListItem = {
  id: "preview-unsourced-claim",
  topicType: "rumor",
  title: "Hearing our captain had a training-ground bust-up before the derby",
  sourceUrl: null,
  sourceDomain: null,
  sourceTitle: null,
  clubId: null,
  clubName: "Juventus",
  createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  openingEntryId: "preview-entry-2",
  openingBody:
    "A friend who lives near the training ground says there was a heated argument after Tuesday's session. No idea how serious it is, but the timing two days before the derby worries me. Has anyone else heard anything about this?",
  authorUsername: "demo_user",
  authorDisplayName: "Demo User",
  authorClubName: "Juventus",
  authorTitleName: "Supporter",
  authorLevel: 1,
};

export const demoTopicUnsourced: TopicListItem = {
  id: "preview-unsourced",
  topicType: "tactical",
  title: "Why a back three suits our current squad better than 4-3-3",
  sourceUrl: null,
  sourceDomain: null,
  sourceTitle: null,
  clubId: null,
  clubName: null,
  createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  openingEntryId: "preview-entry-3",
  openingBody:
    "With both fullbacks injury-prone and our best players being the two centre-backs plus a creative ten, I think a 3-4-2-1 gets more of our quality on the pitch at once. The wingbacks can stay high because the back three covers the channels. Thoughts?",
  authorUsername: "demo_user",
  authorDisplayName: "Demo User",
  authorClubName: "Juventus",
  authorTitleName: "Supporter",
  authorLevel: 1,
};

export const demoTopics: TopicListItem[] = [
  demoTopicSourced,
  demoTopicUnsourcedClaim,
  demoTopicUnsourced,
];

export const demoContributions: ContributionView[] = [
  {
    id: "preview-entry-1",
    body: demoTopicSourced.openingBody,
    isOpening: true,
    createdAt: demoTopicSourced.createdAt,
    authorUsername: demoTopicSourced.authorUsername,
    authorDisplayName: demoTopicSourced.authorDisplayName,
    authorClubName: demoTopicSourced.authorClubName,
    authorTitleName: demoTopicSourced.authorTitleName,
    authorLevel: demoTopicSourced.authorLevel,
    replies: [],
  },
  {
    id: "preview-contribution-1",
    body: "The registration worry is real — we only have one foreign slot left unless someone leaves first. Watch the loan market in the final week.",
    isOpening: false,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    authorUsername: "bianconera_84",
    authorDisplayName: "Bianconera",
    authorClubName: "Juventus",
    authorTitleName: "Club Voice",
    authorLevel: 3,
    replies: [
      {
        id: "preview-reply-1",
        body: "Good point — though I read the slot issue only applies if the second deal also closes. One signing fits fine.",
        createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
        authorUsername: "demo_user",
        authorDisplayName: "Demo User",
      },
    ],
  },
  {
    id: "preview-contribution-2",
    body: "As a Liverpool fan watching from outside: the fee is fair for this market. Midfielders with his pressing numbers went for more last summer.",
    isOpening: false,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    authorUsername: "kop_traveller",
    authorDisplayName: "Kop Traveller",
    authorClubName: "Liverpool",
    authorTitleName: "Regular",
    authorLevel: 2,
    replies: [],
  },
];

export const demoContentRatings: ContentRatingMap = {
  "preview-entry-1": { averageScore: 8.2, ratingCount: 17, myScore: null },
  "preview-contribution-1": { averageScore: 8.4, ratingCount: 12, myScore: 9 },
  "preview-reply-1": { averageScore: 7.0, ratingCount: 4, myScore: null },
  "preview-contribution-2": {
    averageScore: 6.8,
    ratingCount: 9,
    myScore: null,
  },
};

export const demoTopicRating = {
  averageScore: 7.9,
  ratingCount: 23,
  myScore: 8,
};

export const demoEntryRating = {
  averageScore: 8.2,
  ratingCount: 17,
  myScore: null,
};

/** Feed cards with opening-post rating plus total posts/replies. */
export const demoFeedTopics = [
  {
    ...demoTopicSourced,
    ratingAverage: 7.9,
    ratingCount: 23,
    contributionCount: 3,
    interactionCount: 6,
  },
  {
    ...demoTopicUnsourcedClaim,
    ratingAverage: 4.2,
    ratingCount: 6,
    contributionCount: 11,
    interactionCount: 18,
  },
  {
    ...demoTopicUnsourced,
    ratingAverage: 8.6,
    ratingCount: 14,
    contributionCount: 7,
    interactionCount: 12,
  },
];

export const demoSidebarItems = demoFeedTopics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  ratingAverage: topic.ratingAverage,
  ratingCount: topic.ratingCount,
  contributionCount: topic.contributionCount,
  href: `/preview?topic=${encodeURIComponent(topic.id)}`,
}));
