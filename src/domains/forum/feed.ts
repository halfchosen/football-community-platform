/** Public feed categories, identity scopes, and login-prompt copy (Sprint 2D). */

export const JOIN_PROMPT_MESSAGE =
  "Join the football talk — post, reply, and rate.";

export type FeedCategory = {
  /** URL value (?type=). */
  value: string;
  label: string;
  /** forum_topics.topic_type this maps to; null = no filter (All). */
  topicType: string | null;
  /** Short label used in the horizontal feed navigation. */
  navLabel?: string;
  /** Future module — selectable, but always renders an empty state. */
  comingSoon?: boolean;
};

export const FEED_CATEGORIES: FeedCategory[] = [
  { value: "all", label: "All", topicType: null },
  {
    value: "transfer",
    label: "Transfers",
    navLabel: "Transfer",
    topicType: "transfer",
  },
  {
    value: "rumours",
    label: "Rumours",
    navLabel: "Rumors",
    topicType: "rumor",
  },
  { value: "news", label: "News", topicType: "news" },
  { value: "official", label: "Official", topicType: "official" },
  { value: "match", label: "Match", topicType: "match" },
  {
    value: "tactical",
    label: "Tactical",
    navLabel: "Tactics",
    topicType: "tactical",
  },
  { value: "history", label: "History", topicType: "history" },
  {
    value: "questions",
    label: "Questions",
    navLabel: "Q&A",
    topicType: "question",
  },
  { value: "quizzes", label: "Quizzes", topicType: null, comingSoon: true },
  { value: "other", label: "Other", topicType: "other" },
];

// The primary feed stays intentionally compact. Official and miscellaneous
// topics remain visible in All; experimental quizzes stay out of navigation.
const FEED_NAV_VALUES = [
  "all",
  "news",
  "transfer",
  "rumours",
  "match",
  "tactical",
  "history",
  "questions",
];

export const FEED_NAV_CATEGORIES = FEED_NAV_VALUES.flatMap((value) => {
  const category = FEED_CATEGORIES.find((entry) => entry.value === value);
  return category ? [category] : [];
});

export function toFeedTag(value: string) {
  const compact = normalizeFeedTag(value);
  return `#${compact || "club"}`;
}

export function getFeedHashtag(query: string | undefined) {
  const trimmed = query?.trim() ?? "";
  if (!trimmed.startsWith("#")) {
    return null;
  }

  return normalizeFeedTag(trimmed.slice(1)) || null;
}

export function getFeedCategoryByTag(tag: string | null) {
  if (!tag) {
    return null;
  }

  return (
    FEED_CATEGORIES.find((category) =>
      [category.value, category.label, category.navLabel].some(
        (value) => value && normalizeFeedTag(value) === tag,
      ),
    ) ?? null
  );
}

function normalizeFeedTag(value: string) {
  return value
    .toLocaleLowerCase("en")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

export function getFeedCategory(value: string | undefined): FeedCategory {
  return (
    FEED_CATEGORIES.find((category) => category.value === value) ??
    FEED_CATEGORIES[0]
  );
}

/** Identity scope for the secondary filter (?scope=). */
export type FeedScope = "all" | "fan" | "likes" | "club" | "league";

export const QUIZZES_EMPTY_MESSAGE =
  "No quiz topics yet — quizzes are coming in a later sprint.";
