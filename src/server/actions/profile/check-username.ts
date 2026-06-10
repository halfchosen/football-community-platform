"use server";

import { USERNAME_PATTERN } from "@/domains/profile/schemas";
import { createClient } from "@/lib/supabase/server";

export type UsernameAvailability = "available" | "taken" | "invalid" | "unknown";

/**
 * Instant username availability check for the onboarding form. Uses the
 * is_username_available SECURITY DEFINER function (user_profiles RLS only
 * exposes a user's own row). Fails open as "unknown" when the function is
 * unavailable — the database unique constraint still guards submission.
 */
export async function checkUsernameAvailability(
  rawUsername: string,
): Promise<UsernameAvailability> {
  const username = String(rawUsername ?? "")
    .trim()
    .toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return "invalid";
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_username_available", {
    candidate: username,
  });

  if (error || typeof data !== "boolean") {
    return "unknown";
  }

  return data ? "available" : "taken";
}
