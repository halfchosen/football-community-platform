"use server";

import { redirect } from "next/navigation";
import { getCaptchaToken, validateCaptchaToken } from "@/lib/auth/config";
import { normalizeEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

const RECENT_LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function deleteAccount(formData: FormData) {
  const confirmationEmail = normalizeEmail(formData.get("confirmationEmail"));
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const captchaToken = getCaptchaToken(formData);
  const captchaError = validateCaptchaToken(captchaToken);

  if (captchaError) {
    redirect(`/settings/account?deleteError=${encodeURIComponent(captchaError)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?error=Your session expired. Sign in and try again.");
  }

  if (confirmationEmail !== normalizeEmail(user.email)) {
    redirect(
      "/settings/account?deleteError=Type your account email exactly to confirm deletion.",
    );
  }

  const providers = Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers
    : [];

  if (providers.includes("email")) {
    if (!currentPassword) {
      redirect(
        "/settings/account?deleteError=Enter your current password to delete the account.",
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
      options: { captchaToken },
    });

    if (error) {
      redirect(
        "/settings/account?deleteError=Your current password is incorrect.",
      );
    }
  } else {
    const lastSignInAt = user.last_sign_in_at
      ? new Date(user.last_sign_in_at).getTime()
      : 0;

    if (Date.now() - lastSignInAt > RECENT_LOGIN_WINDOW_MS) {
      redirect(
        "/settings/account?deleteError=For security, sign out and sign in again before deleting this social-login account.",
      );
    }
  }

  const { data, error } = await supabase.functions.invoke<{
    success?: boolean;
  }>("delete-account", { body: {} });

  if (error || !data?.success) {
    redirect(
      "/settings/account?deleteError=We could not finish the deletion safely. Please retry or contact support before using the account again.",
    );
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect(
    "/login?message=Your account was deleted and your community posts were anonymized.",
  );
}
