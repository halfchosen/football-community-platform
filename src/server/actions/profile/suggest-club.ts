"use server";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export type SuggestClubResult = { ok: true } | { ok: false; error: string };

/**
 * "My club is not listed" waitlist flow. Stores the suggestion as a pending
 * row in club_suggestions — it does NOT become an active FAN/LIKE club and
 * does not appear in pickers until reviewed and merged into the catalog.
 */
export async function suggestClub(
  rawName: string,
  context: "primary" | "secondary",
): Promise<SuggestClubResult> {
  const user = await requireUser();
  const name = String(rawName ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Write a club name between 2 and 80 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("club_suggestions").insert({
    user_id: user.id,
    context,
    suggested_name: name,
  });

  if (error) {
    if (
      error.message.includes("club_suggestions") &&
      (error.message.includes("schema cache") || error.message.includes("does not exist"))
    ) {
      return {
        ok: false,
        error: "Club suggestions are temporarily unavailable. Please try again later.",
      };
    }

    return { ok: false, error: error.message };
  }

  return { ok: true };
}
