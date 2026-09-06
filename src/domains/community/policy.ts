/** Public policy copy. PostgreSQL is the authoritative enforcement layer. */
export const COMMUNITY_POLICY = {
  version: "2026-09-05",
  termsVersion: "2026-09-05",
  privacyVersion: "2026-09-05",
  rulesVersion: "2026-09-05",
  topicsPerDay: 5,
  postsPerDay: 30,
  repliesPerDay: 60,
  ratingsPerDay: 100,
  awayPostsPerClubPerDay: 1,
  awayRepliesPerClubPerDay: 3,
  interveningPosts: 2,
  recoveryDays: 30,
  seatsPerClub: 1000,
} as const;

export const REPORT_REASONS = {
  abuse: "Harassment or abuse",
  hate: "Hate or discrimination",
  threat: "Threats or violence",
  spam: "Spam or manipulation",
  privacy: "Personal information",
  copyright: "Copyright or trademark",
  illegal: "Other illegal content",
  other: "Something else",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;
export type ContentKind = "entry" | "comment";
export type MembershipState =
  | "active"
  | "waitlisted"
  | "frozen"
  | "suspended"
  | "deleted";

export type Membership = {
  user_id: string;
  state: MembershipState;
  wave_id: string;
  club_id: string | null;
  seat_number: number | null;
  writer_status: string;
  deletion_requested_at: string | null;
  deletion_due_at: string | null;
  admitted_at: string | null;
};

export type ActivityItem = {
  id: string;
  kind: ContentKind;
  topic_id: string;
  topic_title: string;
  body: string;
  status: string;
  created_at: string;
  deleted_at: string | null;
  is_opening: boolean;
};

export const WRITER_STATUSES = [
  {
    name: "Supporter",
    description: "Your first voice in the crowd.",
    posts: 0,
    days: 0,
    raters: 0,
  },
  {
    name: "Regular",
    description: "A familiar face with something to say.",
    posts: 10,
    days: 7,
    raters: 0,
  },
  {
    name: "Club Voice",
    description: "Consistent takes that other fans value.",
    posts: 50,
    days: 30,
    raters: 10,
  },
  {
    name: "Leading Voice",
    description: "A trusted writer across matchdays.",
    posts: 150,
    days: 90,
    raters: 30,
  },
  {
    name: "Club Captain",
    description:
      "Recognised by the community team for leadership and fair play.",
    posts: null,
    days: null,
    raters: null,
  },
] as const;

export function communityError(message: string) {
  const known: Record<string, string> = {
    daily_topic_limit:
      "You've started 5 topics today. Your allowance resets at midnight UTC.",
    daily_post_limit:
      "You've posted 30 takes today. Come back after midnight UTC.",
    daily_reply_limit:
      "You've sent 60 replies today. Come back after midnight UTC.",
    daily_rating_limit:
      "You've rated 100 posts today. Come back after midnight UTC.",
    away_post_limit:
      "You've used your daily away post for this club. You can still reply and rate.",
    away_reply_limit:
      "You've used your 3 away replies for this club today. You can still read and rate.",
    post_spacing:
      "Let two posts from other writers come in before posting here again. You can still reply.",
    slow_down: "Give it a few seconds before posting again.",
    self_rating: "You can't rate your own post.",
    membership_inactive:
      "Your membership is not active. Check your account for the next step.",
    legal_acceptance_required:
      "Please review and accept the current community agreements.",
    club_permission:
      "Start club topics for your FAN club or a club you follow.",
    content_unavailable: "This post is no longer available.",
    restore_expired: "The 30-day recovery period has ended.",
    report_limit: "You've reached the daily report limit. Try again tomorrow.",
    already_reported:
      "You've already reported this post. It's in the review queue.",
  };
  return (
    Object.entries(known).find(([code]) => message.includes(code))?.[1] ??
    "We couldn't complete that. Please try again."
  );
}
