import { createClient } from "@/lib/supabase/server";
import { COMMUNITY_POLICY } from "@/domains/community/policy";
import type {
  OnboardingInput,
  ProfileSettingsInput,
} from "@/domains/profile/schemas";

export async function completeOnboarding(
  _userId: string,
  input: OnboardingInput,
) {
  return saveIdentity(input, true);
}

export async function updateEditableProfile(
  _userId: string,
  input: ProfileSettingsInput,
) {
  return saveIdentity(input, false);
}

async function saveIdentity(
  input: OnboardingInput | ProfileSettingsInput,
  joining: boolean,
) {
  if (
    input.primaryClub.suggestionName ||
    input.secondaryClubs.some((club) => club.suggestionName)
  )
    return "The club catalog is temporarily unavailable. Please retry before claiming your place.";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_community_identity", {
    p_join: joining,
    p_input: {
      username: input.username,
      displayName: "displayName" in input ? input.displayName : null,
      primaryClubId: input.primaryClub.clubId,
      secondaryClubIds: input.secondaryClubs.flatMap((club) =>
        club.clubId ? [club.clubId] : [],
      ),
      preferredLanguage: input.preferredLanguage,
      is18PlusConfirmed:
        "is18PlusConfirmed" in input && input.is18PlusConfirmed,
      termsVersion: COMMUNITY_POLICY.termsVersion,
      privacyVersion: COMMUNITY_POLICY.privacyVersion,
      rulesVersion: COMMUNITY_POLICY.rulesVersion,
    },
  });
  if (error) {
    if (error.code === "23505")
      return "That username is already taken — try another.";
    if (error.code === "P0001") return error.message;
    return "Your profile couldn't be saved. Please try again.";
  }
  return data === "waitlisted"
    ? "Your club's places are full. You're on the waiting list; your email stays private. Check back here for a place in a later wave."
    : null;
}
