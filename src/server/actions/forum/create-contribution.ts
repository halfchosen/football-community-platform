"use server";

import { revalidatePath } from "next/cache";
import {
  parseCreateContributionInput,
  validateContributionBody,
} from "@/domains/forum/contributions";
import { GUEST_LIMIT_REACHED_MESSAGE } from "@/domains/forum/participation";
import type { ContributionView } from "@/domains/forum/discussion";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getTopicById } from "@/lib/db/queries/topics";
import { createClient } from "@/lib/supabase/server";
import { classifyParticipation } from "@/server/services/forum-participation";

export type CreateContributionActionState =
  | { success: true; contribution: ContributionView }
  | {
      success?: false;
      fieldError?: string;
      formError?: string;
    }
  | null;

export async function createContribution(
  _previousState: CreateContributionActionState,
  formData: FormData,
): Promise<CreateContributionActionState> {
  const { user, profile } = await requireOnboardingComplete();
  const input = parseCreateContributionInput(formData);
  const bodyError = validateContributionBody(input.body);

  if (bodyError) {
    return { fieldError: bodyError };
  }

  const topic = await getTopicById(input.topicId);

  if (!topic) {
    return { formError: "This topic no longer exists." };
  }

  const participation = await classifyParticipation(topic, user.id);

  if (participation.role === "guest" && (participation.guestRemaining ?? 0) <= 0) {
    return { formError: GUEST_LIMIT_REACHED_MESSAGE };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_entries")
    .insert({
      topic_id: topic.id,
      author_id: user.id,
      body: input.body,
      is_opening: false,
    })
    .select("id, body, created_at")
    .single();

  if (error) {
    if (error.message.includes("guest contribution limit reached")) {
      return { formError: GUEST_LIMIT_REACHED_MESSAGE };
    }

    console.error("Failed to create topic contribution", {
      code: error.code,
      message: error.message,
    });

    return {
      formError: "We couldn't post that. Please try again.",
    };
  }

  const inserted = data as unknown as {
    id: string;
    body: string;
    created_at: string;
  };

  revalidatePath("/");

  return {
    success: true,
    contribution: {
      id: inserted.id,
      body: inserted.body,
      isOpening: false,
      createdAt: inserted.created_at,
      authorUsername: profile.username,
      authorDisplayName: profile.display_name,
      authorClubName: null,
      authorTitleName: null,
      authorLevel: null,
      replies: [],
    },
  };
}
