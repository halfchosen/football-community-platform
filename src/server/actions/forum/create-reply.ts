"use server";

import { revalidatePath } from "next/cache";
import {
  parseCreateReplyInput,
  validateReplyBody,
} from "@/domains/forum/contributions";
import { GUEST_LIMIT_REACHED_MESSAGE } from "@/domains/forum/participation";
import type { ReplyView } from "@/domains/forum/discussion";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getTopicById } from "@/lib/db/queries/topics";
import { createClient } from "@/lib/supabase/server";
import { classifyParticipation } from "@/server/services/forum-participation";

export type CreateReplyActionState =
  | { success: true; reply: ReplyView; contributionId: string }
  | {
      success?: false;
      fieldError?: string;
      formError?: string;
    }
  | null;

export async function createReply(
  _previousState: CreateReplyActionState,
  formData: FormData,
): Promise<CreateReplyActionState> {
  const { user, profile } = await requireOnboardingComplete();
  const input = parseCreateReplyInput(formData);
  const bodyError = validateReplyBody(input.body);

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
  const { data: contribution } = await supabase
    .from("forum_entries")
    .select("id, topic_id, status")
    .eq("id", input.contributionId)
    .maybeSingle();
  const contributionRow = contribution as unknown as {
    id: string;
    topic_id: string;
    status: string;
  } | null;

  if (
    !contributionRow ||
    contributionRow.status !== "active" ||
    contributionRow.topic_id !== topic.id
  ) {
    return { formError: "The post you are replying to no longer exists." };
  }

  const { data, error } = await supabase
    .from("forum_comments")
    .insert({
      topic_id: topic.id,
      entry_id: contributionRow.id,
      author_id: user.id,
      body: input.body,
    })
    .select("id, body, created_at")
    .single();

  if (error) {
    if (error.message.includes("guest contribution limit reached")) {
      return { formError: GUEST_LIMIT_REACHED_MESSAGE };
    }

    console.error("Failed to create contribution reply", {
      code: error.code,
      message: error.message,
    });

    return { formError: "We couldn't post your reply. Please try again." };
  }

  const inserted = data as unknown as {
    id: string;
    body: string;
    created_at: string;
  };

  revalidatePath("/");

  return {
    success: true,
    contributionId: contributionRow.id,
    reply: {
      id: inserted.id,
      body: inserted.body,
      createdAt: inserted.created_at,
      authorUsername: profile.username,
      authorDisplayName: profile.display_name,
    },
  };
}
