import type { TopicListItem } from "@/lib/db/queries/topics";
import type { CommentView } from "@/lib/db/queries/forum";
import type { CommentRatingMap } from "@/components/forum/comments-section";

// Demo forum data for the preview hub: one topic per source-badge state,
// plus a full thread (opening entry, comments, replies, ratings).

export const demoTopicSourced: TopicListItem = {
  id: "preview-sourced",
  topicType: "transfer",
  title: "Juventus reportedly agree personal terms with young midfielder",
  sourceUrl: "https://www.example-sports-news.com/transfers/juventus-midfielder",
  sourceDomain: "example-sports-news.com",
  sourceTitle: "Juventus close in on midfield target",
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

export const demoComments: CommentView[] = [
  {
    id: "preview-comment-1",
    body: "The registration worry is real — we only have one foreign slot left unless someone leaves first. Watch the loan market in the final week.",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    authorUsername: "bianconera_84",
    authorDisplayName: "Bianconera",
    replyingTo: null,
    replies: [
      {
        id: "preview-reply-1",
        body: "Good point — though I read the slot issue only applies if the second deal also closes. One signing fits fine.",
        createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
        authorUsername: "demo_user",
        authorDisplayName: "Demo User",
        replyingTo: "bianconera_84",
        replies: [],
      },
    ],
  },
  {
    id: "preview-comment-2",
    body: "As a Liverpool fan watching from outside: the fee is fair for this market. Midfielders with his pressing numbers went for more last summer.",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    authorUsername: "kop_traveller",
    authorDisplayName: "Kop Traveller",
    replyingTo: null,
    replies: [],
  },
];

export const demoCommentRatings: CommentRatingMap = {
  "preview-comment-1": { averageScore: 8.4, ratingCount: 12, myScore: 9 },
  "preview-reply-1": { averageScore: 7.0, ratingCount: 4, myScore: null },
  "preview-comment-2": { averageScore: 6.8, ratingCount: 9, myScore: null },
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

/** Feed cards with engagement meta (rating average/count + comment count). */
export const demoFeedTopics = [
  { ...demoTopicSourced, ratingAverage: 7.9, ratingCount: 23, commentCount: 3 },
  {
    ...demoTopicUnsourcedClaim,
    ratingAverage: 4.2,
    ratingCount: 6,
    commentCount: 11,
  },
  { ...demoTopicUnsourced, ratingAverage: 8.6, ratingCount: 14, commentCount: 7 },
];

export const demoSidebarItems = [
  ...demoFeedTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    ratingAverage: topic.ratingAverage,
    ratingCount: topic.ratingCount,
    commentCount: topic.commentCount,
    href: "/zzpreview/feed/topic",
  })),
  {
    id: "trend-derby",
    title: "Derby line-ups: the midfield decision splitting both fanbases",
    ratingAverage: 8.1,
    ratingCount: 18,
    commentCount: 34,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-window",
    title: "Summer window tracker: confirmed deals across Europe",
    ratingAverage: 7.6,
    ratingCount: 29,
    commentCount: 27,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-youth",
    title: "Five academy players ready for first-team minutes this season",
    ratingAverage: 8.8,
    ratingCount: 21,
    commentCount: 19,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-away",
    title: "Best away sections in Europe — supporters rank their trips",
    ratingAverage: 8.3,
    ratingCount: 41,
    commentCount: 52,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-tactics",
    title: "Why compact back fours are returning after years of high lines",
    ratingAverage: 7.9,
    ratingCount: 16,
    commentCount: 23,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-captains",
    title: "Which current captain best represents their club's identity?",
    ratingAverage: 8.0,
    ratingCount: 25,
    commentCount: 46,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-pressing",
    title: "The pressing numbers behind this season's surprise contenders",
    ratingAverage: 8.5,
    ratingCount: 32,
    commentCount: 31,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-stadiums",
    title: "Stadium atmosphere table: supporters share their matchday ratings",
    ratingAverage: 8.7,
    ratingCount: 54,
    commentCount: 63,
    href: "/zzpreview/feed/topic",
  },
  {
    id: "trend-managers",
    title: "Managers under pressure before the first international break",
    ratingAverage: 7.4,
    ratingCount: 19,
    commentCount: 38,
    href: "/zzpreview/feed/topic",
  },
];
