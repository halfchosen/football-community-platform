import { getMembership, hasCurrentAgreements } from "@/lib/community/queries";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/db/queries/profiles";

export const getAuthenticatedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

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

  const membership = await getMembership(user.id);
  if (membership?.state === "frozen" || membership?.state === "deleted")
    redirect("/account/recovery");
  if (membership?.state === "suspended") redirect("/account/recovery");

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  if (!membership || membership.state !== "active") redirect("/onboarding");
  if (!(await hasCurrentAgreements(user.id))) redirect("/agreements");
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
