import {
  GUEST_COMMENT_LIMIT,
  isClubTopic,
  type ParticipationRole,
} from "@/domains/forum/participation";
import type { ClubOption } from "@/lib/db/queries/clubs";
import { countRecentCommentsByUser } from "@/lib/db/queries/forum";
import {
  getOwnProfileSummary,
  getSecondaryClubIdentities,
} from "@/lib/db/queries/profiles";

export type ClubRelation = "fan" | "following" | "guest";

export type Participation = {
  role: ParticipationRole;
  /** Remaining guest comments in the rolling window; null when unlimited. */
  guestRemaining: number | null;
};

/**
 * Relation between the viewer's football identity and a club: FAN club match
 * → "fan", teams-I-like match → "following", otherwise "guest" (including
 * "I don't support any club" users). Matching uses club id when available and
 * falls back to name comparison so fallback-catalog identities (stored as
 * suggestion names) are honoured.
 */
export async function classifyClubRelation(
  club: { clubId: string | null; clubName: string | null },
  userId: string,
): Promise<ClubRelation> {
  const [profile, secondaryClubs] = await Promise.all([
    getOwnProfileSummary(userId),
    getSecondaryClubIdentities(userId),
  ]);

  const clubName = club.clubName?.toLowerCase() ?? null;

  const isFan = Boolean(
    (club.clubId && profile?.primaryClubId === club.clubId) ||
      (clubName &&
        profile?.primaryClubName &&
        profile.primaryClubName.toLowerCase() === clubName),
  );

  if (isFan) {
    return "fan";
  }

  const isFollowing = secondaryClubs.some(
    (secondary) =>
      (club.clubId && secondary.clubId === club.clubId) ||
      (clubName && secondary.displayName.toLowerCase() === clubName),
  );

  return isFollowing ? "following" : "guest";
}

/** Viewer classification for an existing topic, including the guest budget. */
export async function classifyParticipation(
  topic: { id: string; clubId: string | null; clubName: string | null },
  userId: string,
): Promise<Participation> {
  if (!isClubTopic(topic)) {
    return { role: "member", guestRemaining: null };
  }

  const relation = await classifyClubRelation(topic, userId);

  if (relation !== "guest") {
    return { role: relation, guestRemaining: null };
  }

  const used = await countRecentCommentsByUser(topic.id, userId);

  return {
    role: "guest",
    guestRemaining: Math.max(0, GUEST_COMMENT_LIMIT - used),
  };
}

/**
 * Catalog club ids (database uuids or local fallback ids) the user may
 * create club topics for: their FAN club plus teams they like/follow.
 * Identity stored as suggestion names is matched back to the catalog by name.
 */
export async function getEligibleClubIds(
  userId: string,
  clubs: ClubOption[],
): Promise<string[]> {
  const [profile, secondaryClubs] = await Promise.all([
    getOwnProfileSummary(userId),
    getSecondaryClubIdentities(userId),
  ]);

  const byName = new Map<string, string>();

  for (const club of clubs) {
    byName.set(club.name.toLowerCase(), club.id);
  }

  const eligible = new Set<string>();

  if (profile?.primaryClubId) {
    eligible.add(profile.primaryClubId);
  } else if (profile?.primaryClubName) {
    const match = byName.get(profile.primaryClubName.toLowerCase());

    if (match) {
      eligible.add(match);
    }
  }

  for (const secondary of secondaryClubs) {
    if (secondary.clubId) {
      eligible.add(secondary.clubId);
    } else {
      const match = byName.get(secondary.displayName.toLowerCase());

      if (match) {
        eligible.add(match);
      }
    }
  }

  return [...eligible];
}
