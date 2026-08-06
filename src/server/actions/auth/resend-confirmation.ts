"use server";

import { redirect } from "next/navigation";
import { getCaptchaToken, validateCaptchaToken } from "@/lib/auth/config";
import {
  getEmailActionErrorMessage,
  RESEND_NEUTRAL_MESSAGE,
} from "@/lib/auth/messages";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";
import { normalizeEmail, validateEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function resendConfirmation(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const captchaToken = getCaptchaToken(formData);
  const validationError =
    validateEmail(email) ?? validateCaptchaToken(captchaToken);

  if (validationError) {
    redirect(`/resend-confirmation?error=${encodeURIComponent(validationError)}`);
  }

  const supabase = await createClient();
  const emailRedirectTo = await getAuthRedirectUrl(
    "/auth/callback?next=/onboarding",
  );
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { captchaToken, emailRedirectTo },
  });

  if (error) {
    const message = getEmailActionErrorMessage(error);
    if (message) {
      redirect(`/resend-confirmation?error=${encodeURIComponent(message)}`);
    }
  }

  redirect(
    `/resend-confirmation?message=${encodeURIComponent(RESEND_NEUTRAL_MESSAGE)}`,
  );
}
