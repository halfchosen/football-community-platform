/**
 * Club-topic participation rules (Sprint 2B).
 *
 * Inside users (the topic club is their FAN club or in their teams-I-like)
 * participate without limits. Outside users ("guests", including users with
 * no FAN club) can read and rate freely but may publish at most
 * GUEST_CONTRIBUTION_LIMIT contributions+replies per rolling 24h window.
 */

export type ParticipationRole = "fan" | "following" | "guest" | "member";

export const GUEST_CONTRIBUTION_LIMIT = 3;
export const GUEST_LIMIT_WINDOW_HOURS = 24;

export const GUEST_LIMIT_REACHED_MESSAGE =
  "You've reached today's post limit for this club topic. Fans and followers of this club can post without this limit.";

export const CLUB_TOPIC_PERMISSION_MESSAGE =
  "You can only create club topics for your FAN club or teams you like/follow.";

export const NO_ELIGIBLE_CLUBS_MESSAGE =
  "You need a FAN club or a team you like/follow to create a club-specific topic.";

export function guestRemainingMessage(remaining: number) {
  return `${remaining} of ${GUEST_CONTRIBUTION_LIMIT} guest posts left today`;
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
