"use server";

import { requireOnboardingComplete } from "@/lib/auth/guards";
import {
  FAN_CLUB_LOCKED_MESSAGE,
  LIKED_CLUBS_COOLDOWN_MESSAGE,
  ONE_CLUB_PER_LEAGUE_MESSAGE,
  parseProfileSettingsInput,
  validateProfileFields,
  type ProfileFieldErrors,
} from "@/domains/profile/schemas";
import { updateEditableProfile } from "@/server/services/profile-service";

export type ProfileSettingsActionState = {
  fieldErrors?: ProfileFieldErrors;
  formError?: string;
  success?: boolean;
} | null;

export async function updateProfile(
  _previousState: ProfileSettingsActionState,
  formData: FormData,
): Promise<ProfileSettingsActionState> {
  const { user } = await requireOnboardingComplete();
  const input = parseProfileSettingsInput(formData);
  const fieldErrors = validateProfileFields(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const error = await updateEditableProfile(user.id, input).catch((caught) =>
    caught instanceof Error ? caught.message : "Could not update profile.",
  );

  if (error) {
    if (error.includes("username is already taken")) {
      return { fieldErrors: { username: error } };
    }

    if (error === FAN_CLUB_LOCKED_MESSAGE) {
      return { fieldErrors: { primaryClub: error } };
    }

    if (
      error === ONE_CLUB_PER_LEAGUE_MESSAGE ||
      error === LIKED_CLUBS_COOLDOWN_MESSAGE
    ) {
      return { fieldErrors: { secondaryClubs: error } };
    }

    return { formError: error };
  }

  return { success: true };
}
