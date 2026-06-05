"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  parseOnboardingInput,
  validateOnboardingInput,
} from "@/domains/profile/schemas";
import { completeOnboarding as completeOnboardingService } from "@/server/services/profile-service";

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  const input = parseOnboardingInput(formData);
  const validationError = validateOnboardingInput(input);

  if (validationError) {
    redirect(`/onboarding?error=${encodeURIComponent(validationError)}`);
  }

  const error = await completeOnboardingService(user.id, input).catch((caught) =>
    caught instanceof Error ? caught.message : "Could not complete onboarding.",
  );

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error)}`);
  }

  redirect("/app");
}
