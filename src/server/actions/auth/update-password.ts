"use server";

import { redirect } from "next/navigation";
import { getPasswordUpdateErrorMessage } from "@/lib/auth/messages";
import {
  validateNewPassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const validationError =
    validateNewPassword(password) ??
    validatePasswordConfirmation(password, confirmPassword);

  if (validationError) {
    redirect(`/update-password?error=${encodeURIComponent(validationError)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/reset-password?error=Your password reset session is missing or expired. Request a new link and try again.",
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      `/update-password?error=${encodeURIComponent(getPasswordUpdateErrorMessage(error))}`,
    );
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect("/login?message=Password updated. Sign in with your new password.");
}
