"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  ONE_CLUB_PER_LEAGUE_MESSAGE,
  parseOnboardingInput,
  validateOnboardingFields,
  type ProfileFieldErrors,
} from "@/domains/profile/schemas";
import { completeOnboarding as completeOnboardingService } from "@/server/services/profile-service";

export type OnboardingActionState = {
  fieldErrors?: ProfileFieldErrors;
  formError?: string;
} | null;

export async function completeOnboarding(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const user = await requireUser();
  const input = parseOnboardingInput(formData);
  const fieldErrors = validateOnboardingFields(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const error = await completeOnboardingService(user.id, input).catch((caught) =>
    caught instanceof Error ? caught.message : "Could not complete onboarding.",
  );

  if (error) {
    if (error.includes("username is already taken")) {
      return { fieldErrors: { username: error } };
    }

    if (error === ONE_CLUB_PER_LEAGUE_MESSAGE) {
      return { fieldErrors: { secondaryClubs: error } };
    }

    return { formError: error };
  }

  redirect("/app");
}
