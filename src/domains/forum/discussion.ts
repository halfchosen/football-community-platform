import type { ParticipationRole } from "@/domains/forum/participation";

export type ReplyView = {
  id: string;
  body: string;
  createdAt: string;
  authorUsername: string;
  authorDisplayName: string | null;
  status?: string;
  replyToCommentId?: string | null;
  replyToUsername?: string | null;
};

export type ContributionView = {
  id: string;
  body: string;
  isOpening: boolean;
  createdAt: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorClubName: string | null;
  authorTitleName: string | null;
  authorLevel: number | null;
  authorGenerationName?: string | null;
  status?: string;
  replies: ReplyView[];
  replyCount?: number;
};

export type ContentRatingMap = Record<
  string,
  { averageScore: number; ratingCount: number; myScore: number | null }
>;

export type DiscussionViewer = {
  username: string;
  displayName: string | null;
};

export type TopicContributionsPayload = {
  saved?: boolean;
  page?: number;
  totalPosts?: number;
  quotaDay?: string;
  contributions: ContributionView[];
  ratings: ContentRatingMap;
  participation?: {
    role: ParticipationRole;
    guestRemaining: number | null;
    guestRepliesRemaining?: number | null;
  };
  loggedOut: boolean;
  viewer: DiscussionViewer | null;
};

export function countReplies(contributions: ContributionView[]): number {
  return contributions.reduce(
    (total, contribution) => total + contribution.replies.length,
    0,
  );
}
