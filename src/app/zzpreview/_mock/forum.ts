import type { TopicListItem } from "@/lib/db/queries/topics";

// Demo forum topics for the preview hub: one per source-badge state.

export const demoTopicSourced: TopicListItem = {
  id: "preview-sourced",
  topicType: "transfer",
  title: "Juventus reportedly agree personal terms with young midfielder",
  body: "If this goes through it fixes our biggest gap since last summer. The fee sounds high, but compare it with what mid-table Premier League clubs paid for similar profiles this window — it's actually reasonable. My only worry is squad registration before the deadline.",
  sourceUrl: "https://www.example-sports-news.com/transfers/juventus-midfielder",
  sourceDomain: "example-sports-news.com",
  sourceTitle: "Juventus close in on midfield target",
  createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
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
  body: "A friend who lives near the training ground says there was a heated argument after Tuesday's session. No idea how serious it is, but the timing two days before the derby worries me. Has anyone else heard anything about this?",
  sourceUrl: null,
  sourceDomain: null,
  sourceTitle: null,
  createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
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
  body: "With both fullbacks injury-prone and our best players being the two centre-backs plus a creative ten, I think a 3-4-2-1 gets more of our quality on the pitch at once. The wingbacks can stay high because the back three covers the channels. Thoughts?",
  sourceUrl: null,
  sourceDomain: null,
  sourceTitle: null,
  createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
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
