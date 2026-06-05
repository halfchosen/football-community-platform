"use server";

import { redirect } from "next/navigation";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import {
  parseProfileSettingsInput,
  validateProfileBasics,
} from "@/domains/profile/schemas";
import { updateEditableProfile } from "@/server/services/profile-service";

export async function updateProfile(formData: FormData) {
  const { user } = await requireOnboardingComplete();
  const input = parseProfileSettingsInput(formData);
  const validationError = validateProfileBasics(input);

  if (validationError) {
    redirect(`/settings/profile?error=${encodeURIComponent(validationError)}`);
  }

  const error = await updateEditableProfile(user.id, input).catch((caught) =>
    caught instanceof Error ? caught.message : "Could not update profile.",
  );

  if (error) {
    redirect(`/settings/profile?error=${encodeURIComponent(error)}`);
  }

  redirect("/settings/profile?message=Profile updated.");
}
