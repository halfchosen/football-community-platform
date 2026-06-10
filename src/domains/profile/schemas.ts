import {
  getLocalClubName,
  LOCAL_CLUB_ID_PREFIX,
  LOCAL_LEAGUE_ID_PREFIX,
} from "@/data/football-leagues";

export const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
export const USERNAME_FORMAT_MESSAGE =
  "Use 3–24 characters: lowercase letters, numbers, and underscores.";
export const ONE_CLUB_PER_LEAGUE_MESSAGE =
  "You can pick only one club per league.";
export const FAN_CLUB_REQUIRED_MESSAGE =
  "Choose your FAN club, or select “I don't support any club”.";
export const FAN_CLUB_LOCKED_MESSAGE =
  "Your FAN club is locked. A change request process will be added later.";
export const LIKED_CLUBS_COOLDOWN_MESSAGE =
  "You can update teams you like again after the cooldown period.";

/** FAN club edits are free within this window after first selection. */
export const FAN_CLUB_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Liked clubs can be changed again only after this cooldown. */
export const LIKED_CLUBS_COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000;

export function isFanClubLocked(fanClubSelectedAt: string | null) {
  if (!fanClubSelectedAt) {
    return false;
  }

  return (
    Date.now() - new Date(fanClubSelectedAt).getTime() > FAN_CLUB_EDIT_WINDOW_MS
  );
}

export function isLikedClubsCooldownActive(likedClubsUpdatedAt: string | null) {
  if (!likedClubsUpdatedAt) {
    return false;
  }

  return (
    Date.now() - new Date(likedClubsUpdatedAt).getTime() < LIKED_CLUBS_COOLDOWN_MS
  );
}

const NONE_VALUE = "__none__";

export const SUPPORTED_LANGUAGES = [
  "en",
  "tr",
  "es",
  "it",
  "de",
  "fr",
  "pt",
  "nl",
  "ar",
  "el",
  "ja",
  "zh",
] as const;

const SUPPORTED_LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGES);

/**
 * A club identity always comes from the catalog: either a database club
 * (clubId) or a local fallback-catalog club (stored as a suggestion name with
 * a league key derived from the catalog entry). Arbitrary free-text club
 * names are not accepted as identities — "My club is not listed" routes to
 * the separate club_suggestions waitlist instead.
 */
export type ClubIdentityInput = {
  clubId: string | null;
  suggestionName: string | null;
  leagueId: string | null;
  /** League identity used for the one-club-per-league rule. */
  leagueKey: string | null;
};

export type OnboardingInput = {
  username: string;
  primaryClub: ClubIdentityInput;
  /** Explicit "I don't support any club" choice. */
  noFanClub: boolean;
  secondaryClubs: ClubIdentityInput[];
  preferredLanguage: string;
  is18PlusConfirmed: boolean;
  acceptedRules: boolean;
};

export type ProfileSettingsInput = {
  username: string;
  displayName: string | null;
  primaryClub: ClubIdentityInput;
  noFanClub: boolean;
  secondaryClubs: ClubIdentityInput[];
  preferredLanguage: string;
};

export type ProfileFieldErrors = Partial<
  Record<
    | "username"
    | "preferredLanguage"
    | "primaryClub"
    | "secondaryClubs"
    | "is18PlusConfirmed"
    | "acceptedRules",
    string
  >
>;

export function normalizeUsername(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function normalizeDisplayName(value: FormDataEntryValue | null) {
  const displayName = String(value ?? "").trim();
  return displayName.length > 0 ? displayName : null;
}

export function parseOnboardingInput(formData: FormData): OnboardingInput {
  return {
    username: normalizeUsername(formData.get("username")),
    primaryClub: parseClubIdentity(formData, "primary"),
    noFanClub: formData.get("primaryNoClub") === "on",
    secondaryClubs: parseSecondaryClubs(formData),
    preferredLanguage: String(formData.get("preferredLanguage") ?? "en"),
    is18PlusConfirmed: formData.get("is18PlusConfirmed") === "on",
    acceptedRules: formData.get("acceptedRules") === "on",
  };
}

export function parseProfileSettingsInput(
  formData: FormData,
): ProfileSettingsInput {
  return {
    username: normalizeUsername(formData.get("username")),
    displayName: normalizeDisplayName(formData.get("displayName")),
    primaryClub: parseClubIdentity(formData, "primary"),
    noFanClub: formData.get("primaryNoClub") === "on",
    secondaryClubs: parseSecondaryClubs(formData),
    preferredLanguage: String(formData.get("preferredLanguage") ?? "en"),
  };
}

export function validateProfileFields(
  input: ProfileSettingsInput,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (!USERNAME_PATTERN.test(input.username)) {
    errors.username = USERNAME_FORMAT_MESSAGE;
  }

  if (!SUPPORTED_LANGUAGE_SET.has(input.preferredLanguage)) {
    errors.preferredLanguage = "Choose a supported interface language.";
  }

  if (!input.noFanClub && !hasClubIdentity(input.primaryClub)) {
    errors.primaryClub = FAN_CLUB_REQUIRED_MESSAGE;
  }

  const secondaryError = validateSecondaryClubIdentities(
    input.primaryClub,
    input.secondaryClubs,
  );

  if (secondaryError) {
    errors.secondaryClubs = secondaryError;
  }

  if (!errors.secondaryClubs) {
    const leagueError = validateOneClubPerLeague([
      input.primaryClub,
      ...input.secondaryClubs,
    ]);

    if (leagueError) {
      errors.secondaryClubs = leagueError;
    }
  }

  return errors;
}

export function validateOnboardingFields(
  input: OnboardingInput,
): ProfileFieldErrors {
  const errors = validateProfileFields({
    username: input.username,
    displayName: null,
    primaryClub: input.primaryClub,
    noFanClub: input.noFanClub,
    secondaryClubs: input.secondaryClubs,
    preferredLanguage: input.preferredLanguage,
  });

  if (!input.is18PlusConfirmed) {
    errors.is18PlusConfirmed = "Please confirm that you are 18 or older.";
  }

  if (!input.acceptedRules) {
    errors.acceptedRules = "Please accept the community rules to continue.";
  }

  return errors;
}

export function validateOneClubPerLeague(identities: ClubIdentityInput[]) {
  const seenLeagues = new Set<string>();

  for (const identity of identities) {
    if (!identity.leagueKey) {
      continue;
    }

    if (seenLeagues.has(identity.leagueKey)) {
      return ONE_CLUB_PER_LEAGUE_MESSAGE;
    }

    seenLeagues.add(identity.leagueKey);
  }

  return null;
}

export function hasClubIdentity(identity: ClubIdentityInput) {
  return Boolean(identity.clubId || identity.suggestionName);
}

/**
 * Parses one club slot. Only catalog selections are accepted: a database club
 * id, or a local fallback-catalog id (which carries its league inside the id).
 * Anything else — including the old free-text suggestion fields — is ignored.
 */
function parseClubIdentity(formData: FormData, prefix: string): ClubIdentityInput {
  const clubValue = String(formData.get(`${prefix}ClubId`) ?? "").trim();
  const rawLeague = String(formData.get(`${prefix}LeagueId`) ?? "").trim();

  if (clubValue.startsWith(LOCAL_CLUB_ID_PREFIX)) {
    const [localLeague] = clubValue
      .replace(LOCAL_CLUB_ID_PREFIX, "")
      .split(":");

    return {
      clubId: null,
      suggestionName: getLocalClubName(clubValue),
      leagueId: null,
      leagueKey: localLeague || null,
    };
  }

  return {
    clubId: normalizeOptionalId(clubValue),
    suggestionName: null,
    leagueId: normalizeOptionalId(rawLeague),
    leagueKey: normalizeOptionalId(clubValue) && rawLeague.length > 0 ? rawLeague : null,
  };
}

function parseSecondaryClubs(formData: FormData) {
  return [0, 1, 2]
    .map((index) => parseClubIdentity(formData, `secondary${index}`))
    .filter((identity) => hasClubIdentity(identity));
}

function validateSecondaryClubIdentities(
  primaryClub: ClubIdentityInput,
  secondaryClubs: ClubIdentityInput[],
) {
  if (secondaryClubs.length > 3) {
    return "Choose up to three teams you like.";
  }

  const clubIds = secondaryClubs.flatMap((identity) =>
    identity.clubId ? [identity.clubId] : [],
  );
  const suggestions = secondaryClubs.flatMap((identity) =>
    identity.suggestionName ? [identity.suggestionName.toLowerCase()] : [],
  );

  if (primaryClub.clubId && clubIds.includes(primaryClub.clubId)) {
    return "Teams you like cannot include your FAN club.";
  }

  if (
    primaryClub.suggestionName &&
    suggestions.includes(primaryClub.suggestionName.toLowerCase())
  ) {
    return "Teams you like cannot include your FAN club.";
  }

  if (new Set(clubIds).size !== clubIds.length) {
    return "Choose each team only once.";
  }

  if (new Set(suggestions).size !== suggestions.length) {
    return "Choose each team only once.";
  }

  return null;
}

function normalizeOptionalId(value: FormDataEntryValue | string | null) {
  const id = String(value ?? "").trim();
  return id.length > 0 &&
    id !== NONE_VALUE &&
    id !== "__other__" &&
    !id.startsWith(LOCAL_LEAGUE_ID_PREFIX) &&
    !id.startsWith(LOCAL_CLUB_ID_PREFIX)
    ? id
    : null;
}
