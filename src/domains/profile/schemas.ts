const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
const SUPPORTED_LANGUAGES = new Set(["en", "tr", "es", "it", "de", "fr"]);

export type OnboardingInput = {
  username: string;
  displayName: string | null;
  primaryClubId: string;
  secondaryClubIds: string[];
  preferredLanguage: string;
  is18PlusConfirmed: boolean;
  acceptedRules: boolean;
};

export type ProfileSettingsInput = {
  username: string;
  displayName: string | null;
  primaryClubId: string;
  secondaryClubIds: string[];
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

export function getSecondaryClubIds(formData: FormData) {
  return formData
    .getAll("secondaryClubIds")
    .map(String)
    .filter((clubId) => clubId.length > 0);
}

export function parseOnboardingInput(formData: FormData): OnboardingInput {
  return {
    username: normalizeUsername(formData.get("username")),
    displayName: normalizeDisplayName(formData.get("displayName")),
    primaryClubId: String(formData.get("primaryClubId") ?? ""),
    secondaryClubIds: getSecondaryClubIds(formData),
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
    primaryClubId: String(formData.get("primaryClubId") ?? ""),
    secondaryClubIds: getSecondaryClubIds(formData),
    preferredLanguage: String(formData.get("preferredLanguage") ?? "en"),
  };
}

export function validateProfileBasics(input: ProfileSettingsInput) {
  if (!USERNAME_PATTERN.test(input.username)) {
    return "Username must be 3-24 characters using lowercase letters, numbers, or underscores.";
  }

  if (!input.primaryClubId) {
    return "Choose your primary supported club.";
  }

  if (!SUPPORTED_LANGUAGES.has(input.preferredLanguage)) {
    return "Choose a supported interface language.";
  }

  if (input.secondaryClubIds.includes(input.primaryClubId)) {
    return "Secondary clubs cannot include your primary club.";
  }

  if (new Set(input.secondaryClubIds).size !== input.secondaryClubIds.length) {
    return "Choose each secondary club only once.";
  }

  if (input.secondaryClubIds.length > 3) {
    return "Choose up to three secondary clubs for Sprint 1.";
  }

  return null;
}

export function validateOnboardingInput(input: OnboardingInput) {
  const profileError = validateProfileBasics(input);

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
