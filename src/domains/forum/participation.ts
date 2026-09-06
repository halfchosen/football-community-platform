/** Club budgets are enforced atomically by PostgreSQL and reset at midnight UTC. */

export type ParticipationRole = "fan" | "following" | "guest" | "member";

export const GUEST_CONTRIBUTION_LIMIT = 1;
export const GUEST_LIMIT_WINDOW_HOURS = 24;

export const GUEST_LIMIT_REACHED_MESSAGE =
  "You've used your daily away post for this club. You can still reply and rate.";

export const CLUB_TOPIC_PERMISSION_MESSAGE =
  "You can only create club topics for your FAN club or teams you like/follow.";

export const NO_ELIGIBLE_CLUBS_MESSAGE =
  "You need a FAN club or a team you like/follow to create a club-specific topic.";

export function guestRemainingMessage(remaining: number) {
  return `${remaining} of ${GUEST_CONTRIBUTION_LIMIT} away posts left for this club today`;
}

export const PARTICIPATION_BADGES: Record<
  Exclude<ParticipationRole, "member">,
  { label: string; icon: string }
> = {
  fan: { label: "FAN", icon: "★" },
  following: { label: "Following", icon: "✓" },
  guest: { label: "Guest", icon: "👋" },
};

/** A topic without a club association has no participation rules. */
export function isClubTopic(topic: {
  clubId: string | null;
  clubName: string | null;
}) {
  return Boolean(topic.clubId || topic.clubName);
}
