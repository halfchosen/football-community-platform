"use server";

import { redirect } from "next/navigation";
import { getCaptchaToken, validateCaptchaToken } from "@/lib/auth/config";
import { getPasswordUpdateErrorMessage } from "@/lib/auth/messages";
import {
  validateNewPassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function changePassword(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const captchaToken = getCaptchaToken(formData);
  const validationError =
    (!currentPassword ? "Enter your current password." : null) ??
    validateNewPassword(password) ??
    validatePasswordConfirmation(password, confirmPassword) ??
    validateCaptchaToken(captchaToken);

  if (validationError) {
    redirect(
      `/settings/account?passwordError=${encodeURIComponent(validationError)}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?error=Your session expired. Sign in and try again.");
  }

  const providers = Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers
    : [];

  if (!providers.includes("email")) {
    redirect(
      "/settings/account?passwordError=This account uses a social login and does not have an email password.",
    );
  }

  const { error: verificationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
    options: { captchaToken },
  });

  if (verificationError) {
    redirect(
      `/settings/account?passwordError=${encodeURIComponent(getPasswordUpdateErrorMessage(verificationError))}`,
    );
  }

  const { error } = await supabase.auth.updateUser({
    current_password: currentPassword,
    password,
  });

  if (error) {
    redirect(
      `/settings/account?passwordError=${encodeURIComponent(getPasswordUpdateErrorMessage(error))}`,
    );
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect(
    "/login?message=Password changed. For your security, all sessions were signed out.",
  );
}
