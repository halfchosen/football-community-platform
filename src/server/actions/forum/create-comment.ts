"use server";

import { revalidatePath } from "next/cache";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  parseCreateCommentInput,
  validateCommentBody,
} from "@/domains/forum/comments";
import { GUEST_LIMIT_REACHED_MESSAGE } from "@/domains/forum/participation";
import { getTopicById } from "@/lib/db/queries/topics";
import { classifyParticipation } from "@/server/services/forum-participation";

export type CreateCommentActionState = {
  fieldError?: string;
  formError?: string;
  success?: boolean;
} | null;

export async function createComment(
  _previousState: CreateCommentActionState,
  formData: FormData,
): Promise<CreateCommentActionState> {
  const { user } = await requireOnboardingComplete();
  const input = parseCreateCommentInput(formData);

  const bodyError = validateCommentBody(input.body);

  if (bodyError) {
    return { fieldError: bodyError };
  }

  const topic = await getTopicById(input.topicId);

  if (!topic) {
    return { formError: "This topic no longer exists." };
  }

  // Guest limit on club topics — authoritative server-side check.
  const participation = await classifyParticipation(topic, user.id);

  if (participation.role === "guest" && (participation.guestRemaining ?? 0) <= 0) {
    return { formError: GUEST_LIMIT_REACHED_MESSAGE };
  }

  const supabase = await createClient();

  if (input.parentCommentId) {
    const { data: parent } = await supabase
      .from("forum_comments")
      .select("id, topic_id, parent_comment_id, status")
      .eq("id", input.parentCommentId)
      .maybeSingle();

    const parentRow = parent as unknown as {
      topic_id: string;
      parent_comment_id: string | null;
      status: string;
    } | null;

    if (!parentRow || parentRow.status !== "active") {
      return { formError: "The comment you are replying to no longer exists." };
    }

    if (parentRow.topic_id !== topic.id || parentRow.parent_comment_id) {
      return { formError: "Replies can only be one level deep." };
    }
  }

  const { error } = await supabase.from("forum_comments").insert({
    topic_id: topic.id,
    entry_id: input.entryId,
    parent_comment_id: input.parentCommentId,
    author_id: user.id,
    body: input.body,
  });

  if (error) {
    if (
      error.message.includes("forum_comments") &&
      (error.message.includes("schema cache") ||
        error.message.includes("does not exist"))
    ) {
      return {
        formError:
          "Comments are not set up on this database yet. Run the Sprint 2B migration and try again.",
      };
    }

    return { formError: error.message };
  }

  revalidatePath(`/forum/${topic.id}`);

  return { success: true };
}
