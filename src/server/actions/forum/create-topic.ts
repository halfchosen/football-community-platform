"use server";

import { communityError } from "@/domains/community/policy";
import { redirect } from "next/navigation";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  parseCreateTopicInput,
  validateCreateTopicFields,
  type TopicFieldErrors,
} from "@/domains/forum/topics";
import { CLUB_TOPIC_PERMISSION_MESSAGE } from "@/domains/forum/participation";
import { classifyClubRelation } from "@/server/services/forum-participation";
import { getLocalClubName, LOCAL_CLUB_ID_PREFIX } from "@/data/football-leagues";

export type CreateTopicActionState = {
  fieldErrors?: TopicFieldErrors;
  formError?: string;
} | null;

export async function createTopic(
  _previousState: CreateTopicActionState,
  formData: FormData,
): Promise<CreateTopicActionState> {
  const { user } = await requireOnboardingComplete();
  const input = parseCreateTopicInput(formData);
  const fieldErrors = validateCreateTopicFields(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createClient();

  // Optional club association. Catalog clubs only: database clubs resolve
  // their name from the clubs table; local fallback-catalog clubs store the
  // name snapshot (no database row to reference).
  let clubId: string | null = null;
  let clubName: string | null = null;

  if (input.clubChoice) {
    if (input.clubChoice.startsWith(LOCAL_CLUB_ID_PREFIX)) {
      clubName = getLocalClubName(input.clubChoice);

      if (!clubName) {
        return { fieldErrors: { club: "Pick a club from the list." } };
      }
    } else {
      const { data } = await supabase
        .from("clubs")
        .select("id, name")
        .eq("id", input.clubChoice)
        .maybeSingle();

      const club = data as unknown as { id: string; name: string } | null;

      if (!club) {
        return { fieldErrors: { club: "Pick a club from the list." } };
      }

      clubId = club.id;
      clubName = club.name;
    }

    // Club topics are restricted to the author's football identity: the
    // selected club must be their FAN club or one of their teams I
    // like/follow. Authoritative server-side check — the form's disabled
    // options are convenience only.
    const relation = await classifyClubRelation({ clubId, clubName }, user.id);

    if (relation === "guest") {
      return { fieldErrors: { club: CLUB_TOPIC_PERMISSION_MESSAGE } };
    }
  }

  // Atomic topic + opening contribution creation (RLS applies — invoker function).
  const { data, error } = await supabase.rpc("create_forum_topic", {
    p_topic_type: input.topicType,
    p_title: input.title,
    p_body: input.body,
    p_source_url: input.sourceUrl,
    p_source_domain: input.sourceDomain,
    p_club_id: clubId,
    p_club_name: clubName,
  });

  if (error) {
    if (error.message.includes("club topic permission denied")) {
      return { fieldErrors: { club: CLUB_TOPIC_PERMISSION_MESSAGE } };
    }

    if (
      error.message.includes("create_forum_topic") ||
      error.message.includes("schema cache") ||
      error.message.includes("does not exist")
    ) {
      return {
        formError:
          "The forum is not set up on this database yet. Run the Sprint 2 migrations and try again.",
      };
    }

    return { formError: communityError(error.message) };
  }

  redirect(`/?topic=${encodeURIComponent(String(data))}`);
}
