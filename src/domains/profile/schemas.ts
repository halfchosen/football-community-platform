import {
  getLocalClubName,
  LOCAL_CLUB_ID_PREFIX,
  LOCAL_LEAGUE_ID_PREFIX,
} from "@/data/football-leagues";

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
const OTHER_VALUE = "__other__";
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

export type ClubIdentityInput = {
  clubId: string | null;
  suggestionName: string | null;
  leagueId: string | null;
};

export type NationalTeamIdentityInput = {
  nationalTeamId: string | null;
  suggestionName: string | null;
};

export type OnboardingInput = {
  username: string;
  primaryClub: ClubIdentityInput;
  secondaryClubs: ClubIdentityInput[];
  nationalTeam: NationalTeamIdentityInput | null;
  preferredLanguage: string;
  is18PlusConfirmed: boolean;
  acceptedRules: boolean;
};

export type ProfileSettingsInput = {
  username: string;
  displayName: string | null;
  primaryClub: ClubIdentityInput;
  secondaryClubs: ClubIdentityInput[];
  nationalTeam: NationalTeamIdentityInput | null;
  preferredLanguage: string;
};

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
    secondaryClubs: parseSecondaryClubs(formData),
    nationalTeam: parseNationalTeamIdentity(formData),
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
    secondaryClubs: parseSecondaryClubs(formData),
    nationalTeam: parseNationalTeamIdentity(formData),
    preferredLanguage: String(formData.get("preferredLanguage") ?? "en"),
  };
}

export function validateProfileBasics(input: ProfileSettingsInput) {
  if (!USERNAME_PATTERN.test(input.username)) {
    return "Username must be 3-24 characters using lowercase letters, numbers, or underscores.";
  }

  if (!SUPPORTED_LANGUAGE_SET.has(input.preferredLanguage)) {
    return "Choose a supported interface language.";
  }

  const primaryError = validateRequiredClubIdentity(input.primaryClub);

  if (primaryError) {
    return primaryError;
  }

  const secondaryError = validateSecondaryClubIdentities(
    input.primaryClub,
    input.secondaryClubs,
  );

  if (secondaryError) {
    return secondaryError;
  }

  return validateNationalTeamIdentity(input.nationalTeam);
}

export function validateOnboardingInput(input: OnboardingInput) {
  const profileError = validateProfileBasics({
    username: input.username,
    displayName: null,
    primaryClub: input.primaryClub,
    secondaryClubs: input.secondaryClubs,
    nationalTeam: input.nationalTeam,
    preferredLanguage: input.preferredLanguage,
  });

  if (profileError) {
    return profileError;
  }

  if (!input.is18PlusConfirmed) {
    return "Confirm that you are 18 or older.";
  }

  if (!input.acceptedRules) {
    return "Accept the community rules to continue.";
  }

  return null;
}

function parseClubIdentity(formData: FormData, prefix: string): ClubIdentityInput {
  const clubValue = String(formData.get(`${prefix}ClubId`) ?? "");
  const suggestionName = normalizeSuggestionName(
    formData.get(`${prefix}ClubSuggestion`),
  );

  if (clubValue === OTHER_VALUE) {
    return {
      clubId: null,
      suggestionName,
      leagueId: normalizeOptionalId(formData.get(`${prefix}LeagueId`)),
    };
  }

  if (clubValue.startsWith(LOCAL_CLUB_ID_PREFIX)) {
    return {
      clubId: null,
      suggestionName: getLocalClubName(clubValue),
      leagueId: null,
    };
  }

  return {
    clubId: normalizeOptionalId(clubValue),
    suggestionName: null,
    leagueId: normalizeOptionalId(formData.get(`${prefix}LeagueId`)),
  };
}

function parseSecondaryClubs(formData: FormData) {
  return [0, 1, 2]
    .map((index) => parseClubIdentity(formData, `secondary${index}`))
    .filter((identity) => identity.clubId || identity.suggestionName);
}

function parseNationalTeamIdentity(
  formData: FormData,
): NationalTeamIdentityInput | null {
  const value = String(formData.get("nationalTeamId") ?? NONE_VALUE);

  if (value === NONE_VALUE || value.length === 0) {
    return null;
  }

  if (value === OTHER_VALUE) {
    return {
      nationalTeamId: null,
      suggestionName: normalizeSuggestionName(formData.get("nationalTeamSuggestion")),
    };
  }

  return {
    nationalTeamId: value,
    suggestionName: null,
  };
}

function validateRequiredClubIdentity(identity: ClubIdentityInput) {
  if (identity.clubId) {
    return null;
  }

  if (identity.suggestionName && identity.suggestionName.length >= 2) {
    return null;
  }

  return "Choose your primary club or write a club suggestion.";
}

function validateSecondaryClubIdentities(
  primaryClub: ClubIdentityInput,
  secondaryClubs: ClubIdentityInput[],
) {
  if (secondaryClubs.length > 3) {
    return "Choose up to three secondary clubs.";
  }

  const clubIds = secondaryClubs.flatMap((identity) =>
    identity.clubId ? [identity.clubId] : [],
  );
  const suggestions = secondaryClubs.flatMap((identity) =>
    identity.suggestionName ? [identity.suggestionName.toLowerCase()] : [],
  );

  if (primaryClub.clubId && clubIds.includes(primaryClub.clubId)) {
    return "Secondary clubs cannot include your primary club.";
  }

  if (
    primaryClub.suggestionName &&
    suggestions.includes(primaryClub.suggestionName.toLowerCase())
  ) {
    return "Secondary clubs cannot include your primary club suggestion.";
  }

  if (new Set(clubIds).size !== clubIds.length) {
    return "Choose each secondary club only once.";
  }

  if (new Set(suggestions).size !== suggestions.length) {
    return "Choose each secondary club suggestion only once.";
  }

  const invalidSuggestion = secondaryClubs.find(
    (identity) =>
      !identity.clubId &&
      (!identity.suggestionName || identity.suggestionName.length < 2),
  );

  if (invalidSuggestion) {
    return "Write a club name when choosing Other.";
  }

  return null;
}

function validateNationalTeamIdentity(identity: NationalTeamIdentityInput | null) {
  if (!identity) {
    return null;
  }

  if (identity.nationalTeamId) {
    return null;
  }

  if (identity.suggestionName && identity.suggestionName.length >= 2) {
    return null;
  }

  return "Write a national team name when choosing Other.";
}

function normalizeOptionalId(value: FormDataEntryValue | string | null) {
  const id = String(value ?? "").trim();
  return id.length > 0 &&
    id !== OTHER_VALUE &&
    id !== NONE_VALUE &&
    !id.startsWith(LOCAL_LEAGUE_ID_PREFIX) &&
    !id.startsWith(LOCAL_CLUB_ID_PREFIX)
    ? id
    : null;
}

function normalizeSuggestionName(value: FormDataEntryValue | null) {
  const name = String(value ?? "").trim();
  return name.length > 0 ? name : null;
}
