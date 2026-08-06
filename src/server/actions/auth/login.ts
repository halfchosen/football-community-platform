"use server";

import { redirect } from "next/navigation";
import { getCaptchaToken, validateCaptchaToken } from "@/lib/auth/config";
import { getLoginErrorMessage } from "@/lib/auth/messages";
import { normalizeEmail, validateEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const emailError = validateEmail(email);
  const captchaToken = getCaptchaToken(formData);
  const captchaError = validateCaptchaToken(captchaToken);

  if (emailError || !password || captchaError) {
    redirect(
      `/login?error=${encodeURIComponent(emailError ?? captchaError ?? "Enter your password.")}`,
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(getLoginErrorMessage(error))}`);
  }

  redirect("/app");
}
