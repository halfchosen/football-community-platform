"use server";

import { redirect } from "next/navigation";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  parseCreateTopicInput,
  validateCreateTopicFields,
  type TopicFieldErrors,
} from "@/domains/forum/topics";

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
  const { data, error } = await supabase
    .from("forum_topics")
    .insert({
      author_id: user.id,
      topic_type: input.topicType,
      title: input.title,
      body: input.body,
      source_url: input.sourceUrl,
      source_domain: input.sourceDomain,
      // source_title stays null in Sprint 2: we do not fetch external pages.
    })
    .select("id")
    .single();

  if (error) {
    if (
      error.message.includes("forum_topics") &&
      (error.message.includes("schema cache") ||
        error.message.includes("does not exist"))
    ) {
      return {
        formError:
          "The forum is not set up on this database yet. Run the Sprint 2 migration and try again.",
      };
    }

    return { formError: error.message };
  }

  redirect(`/forum/${data.id}`);
}
