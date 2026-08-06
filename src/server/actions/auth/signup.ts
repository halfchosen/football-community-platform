"use server";

import { redirect } from "next/navigation";
import { getCaptchaToken, validateCaptchaToken } from "@/lib/auth/config";
import {
  getSignupErrorMessage,
  SIGNUP_NEUTRAL_MESSAGE,
} from "@/lib/auth/messages";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";
import {
  normalizeEmail,
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const captchaToken = getCaptchaToken(formData);
  const validationError =
    validateEmail(email) ??
    validateNewPassword(password) ??
    validatePasswordConfirmation(password, confirmPassword) ??
    validateCaptchaToken(captchaToken);

  if (validationError) {
    redirect(`/signup?error=${encodeURIComponent(validationError)}`);
  }

  const supabase = await createClient();
  const emailRedirectTo = await getAuthRedirectUrl(
    "/auth/callback?next=/onboarding",
  );

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      captchaToken,
      emailRedirectTo,
    },
  });

  if (error) {
    const message = getSignupErrorMessage(error);
    if (message) {
      redirect(`/signup?error=${encodeURIComponent(message)}`);
    }
  }

  redirect(`/signup?message=${encodeURIComponent(SIGNUP_NEUTRAL_MESSAGE)}`);
}
