/**
 * Forum topic rules (Sprint 2).
 *
 * Media/source policy: topics carry at most a source LINK (url + extracted
 * domain + optional safe page title). No image uploads, no article bodies,
 * no rehosted media. User commentary is always required — a bare link is not
 * a topic.
 */

export const TOPIC_TYPES = [
  { value: "general", label: "General" },
  { value: "transfer", label: "Transfer" },
  { value: "rumor", label: "Rumor" },
  { value: "news", label: "News" },
  { value: "official", label: "Official" },
  { value: "match", label: "Match" },
  { value: "analysis", label: "Analysis" },
  { value: "history", label: "History" },
  { value: "question", label: "Question" },
  { value: "tactical", label: "Tactical" },
  { value: "lineup_idea", label: "Lineup Idea" },
  { value: "finance", label: "Finance" },
  { value: "injury", label: "Injury" },
  { value: "youth", label: "Youth" },
  { value: "nostalgia", label: "Nostalgia" },
  { value: "other", label: "Other" },
] as const;

export type TopicType = (typeof TOPIC_TYPES)[number]["value"];

const TOPIC_TYPE_VALUES = new Set<string>(TOPIC_TYPES.map((t) => t.value));

/** Claim-like types where a missing source must be flagged loudly. */
export const NEWS_LIKE_TYPES: ReadonlySet<TopicType> = new Set([
  "transfer",
  "rumor",
  "news",
  "official",
  "injury",
  "finance",
]);

export const UNSOURCED_NEWS_WARNING =
  "No source link provided — treat this as an unsourced claim or opinion.";

export const SOURCE_FIELD_HINT =
  "Links help readers judge reliability. If you post a transfer, news, injury, or official claim without a source, it will be marked as unsourced.";

export const TITLE_MIN = 8;
export const TITLE_MAX = 140;
export const BODY_MIN = 30;
export const BODY_MAX = 10000;

export function isNewsLikeType(type: string): boolean {
  return NEWS_LIKE_TYPES.has(type as TopicType);
}

export function topicTypeLabel(type: string): string {
  return TOPIC_TYPES.find((t) => t.value === type)?.label ?? "General";
}

export type SourceBadge = {
  kind: "sourced" | "unsourced" | "unsourced-claim";
  label: string;
};

export function getSourceBadge(
  topicType: string,
  sourceUrl: string | null,
): SourceBadge {
  if (sourceUrl) {
    return { kind: "sourced", label: "Source linked" };
  }

  if (isNewsLikeType(topicType)) {
    return { kind: "unsourced-claim", label: "Unsourced claim" };
  }

  return { kind: "unsourced", label: "Unsourced" };
}

export type CreateTopicInput = {
  topicType: string;
  title: string;
  body: string;
  sourceUrl: string | null;
  sourceDomain: string | null;
  /** Catalog club id ("" = general topic); resolved server-side. */
  clubChoice: string;
};

export type TopicFieldErrors = Partial<
  Record<"topicType" | "title" | "body" | "sourceUrl" | "club", string>
>;

export function parseCreateTopicInput(formData: FormData): CreateTopicInput {
  const rawUrl = String(formData.get("sourceUrl") ?? "").trim();
  const sourceUrl = rawUrl.length > 0 ? rawUrl : null;

  return {
    topicType: String(formData.get("topicType") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    sourceUrl,
    sourceDomain: sourceUrl ? extractSourceDomain(sourceUrl) : null,
    clubChoice: String(formData.get("clubId") ?? "").trim(),
  };
}

export function validateCreateTopicFields(
  input: CreateTopicInput,
): TopicFieldErrors {
  const errors: TopicFieldErrors = {};

  if (!TOPIC_TYPE_VALUES.has(input.topicType)) {
    errors.topicType = "Choose a topic type.";
  }

  if (input.title.length < TITLE_MIN || input.title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MIN}–${TITLE_MAX} characters.`;
  }

  if (input.body.length < BODY_MIN || input.body.length > BODY_MAX) {
    errors.body = `Write at least ${BODY_MIN} characters of your own commentary.`;
  } else if (!hasOwnCommentary(input.body)) {
    errors.body =
      "Add your own commentary — a bare link is not enough for a topic.";
  }

  if (input.sourceUrl && !extractSourceDomain(input.sourceUrl)) {
    errors.sourceUrl = "Enter a valid link starting with http:// or https://.";
  }

  return errors;
}

/**
 * The body must contain real commentary, not just pasted links. Strips URLs
 * and checks that meaningful text remains.
 */
export function hasOwnCommentary(body: string): boolean {
  const withoutUrls = body.replace(/https?:\/\/\S+/gi, " ").replace(/\s+/g, " ").trim();
  return withoutUrls.length >= 20;
}

/** Hostname without a leading www., or null when the URL is invalid. */
export function extractSourceDomain(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.hostname.replace(/^www\./i, "").toLowerCase() || null;
  } catch {
    return null;
  }
}
