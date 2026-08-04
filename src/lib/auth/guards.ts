import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/db/queries/profiles";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireOnboardingComplete() {
  const user = await requireUser();
  const profile = await getProfileByUserId(user.id);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return { user, profile };
}

export async function redirectAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return;
  }

  const profile = await getProfileByUserId(user.id);

  if (profile?.onboarding_completed) {
    redirect("/");
  }

  redirect("/onboarding");
}
