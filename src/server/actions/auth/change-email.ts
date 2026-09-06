"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { normalizeEmail, validateEmail } from "@/lib/auth/validation";
import { getCaptchaToken, validateCaptchaToken } from "@/lib/auth/config";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";
export async function changeEmail(form: FormData) {
  const user = await requireUser();
  const email = normalizeEmail(form.get("newEmail"));
  const captchaToken = getCaptchaToken(form);
  const invalid = validateEmail(email) ?? validateCaptchaToken(captchaToken);
  if (invalid)
    redirect(`/settings/account?emailError=${encodeURIComponent(invalid)}`);
  if (email === user.email?.toLowerCase())
    redirect("/settings/account?emailError=Choose a different email address.");
  const supabase = await createClient();
  const providers = Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers
    : [];
  if (providers.includes("email")) {
    const password = String(form.get("currentPassword") ?? "");
    if (!password || !user.email)
      redirect("/settings/account?emailError=Enter your current password.");
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
      options: { captchaToken },
    });
    if (error)
      redirect(
        "/settings/account?emailError=Your password could not be verified.",
      );
  } else if (
    !user.last_sign_in_at ||
    Date.now() - Date.parse(user.last_sign_in_at) > 15 * 60 * 1000
  )
    redirect(
      "/settings/account?emailError=Sign out and sign in again before changing your email.",
    );
  const { error } = await supabase.auth.updateUser(
    { email },
    {
      emailRedirectTo: await getAuthRedirectUrl(
        "/auth/callback?next=/settings/account",
      ),
    },
  );
  if (error)
    redirect(
      "/settings/account?emailError=The email change could not be requested. Please retry later or use a different address.",
    );
  redirect(
    "/settings/account?emailMessage=Check your inboxes and follow the confirmation instructions. Your sign-in address changes only after verification.",
  );
}
export async function signOutEverywhere() {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error)
    redirect(
      "/settings/account?passwordError=Sign-out could not be completed. Please retry.",
    );
  redirect(
    "/login?message=All refresh sessions were signed out. Existing access tokens expire shortly.",
  );
}
