"use server";

import { redirect } from "next/navigation";
import { isGoogleAuthEnabled } from "@/lib/auth/config";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  if (!isGoogleAuthEnabled()) {
    redirect("/login?error=Google login is not available yet.");
  }

  const supabase = await createClient();
  const redirectTo = await getAuthRedirectUrl(
    "/auth/callback?next=/onboarding",
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
      redirectTo,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=Google login could not be started. Please try again.");
  }

  redirect(data.url);
}
