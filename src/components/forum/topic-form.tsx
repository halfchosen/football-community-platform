"use client";

import { useActionState, useState } from "react";
import type { ClubOption } from "@/lib/db/queries/clubs";
import {
  createTopic,
  type CreateTopicActionState,
} from "@/server/actions/forum/create-topic";
import {
  isNewsLikeType,
  SOURCE_FIELD_HINT,
  TITLE_MAX,
  TOPIC_TYPES,
  UNSOURCED_NEWS_WARNING,
} from "@/domains/forum/topics";
import { ValidatedForm } from "@/components/ui/validated-form";
import { FormMessage } from "@/components/ui/form-message";
import {
  FieldError,
  Input,
  Select,
  textareaClassName,
} from "@/components/ui/field";
import { AlertIcon, InfoIcon } from "@/components/ui/icons";
import { SubmitButton } from "@/components/ui/submit-button";

type TopicFormProps = {
  /** Catalog clubs for the optional club association. */
  submitAction?: (
    state: CreateTopicActionState,
    data: FormData,
  ) => Promise<CreateTopicActionState>;
  clubs: ClubOption[];
  /**
   * Clubs the user may create club topics for (FAN club + teams I
   * like/follow), as catalog ids. Other clubs render disabled — the server
   * action re-enforces this regardless.
   */
  eligibleClubIds: string[];
};

// Create-topic form. Media policy: text + optional source link only — there
// is intentionally no image/file upload here. useActionState keeps values on
// errors; the unsourced warning reacts live to type + source changes.
export function TopicForm({
  clubs,
  eligibleClubIds,
  submitAction,
}: TopicFormProps) {
  const [state, formAction] = useActionState<CreateTopicActionState, FormData>(
    submitAction ?? createTopic,
    null,
  );
  const [topicType, setTopicType] = useState<string>("general");
  const [sourceUrl, setSourceUrl] = useState("");

  const showUnsourcedWarning =
    isNewsLikeType(topicType) && sourceUrl.trim().length === 0;
  const errors = state?.fieldErrors ?? {};

  return (
    <ValidatedForm action={formAction} className="grid gap-4" noValidate>
      {state?.formError ? <FormMessage error={state.formError} /> : null}

      <div className="grid gap-4 sm:grid-cols-[0.45fr_1fr] sm:items-start">
        <div className="grid gap-1.5">
          <Select
            label="Topic type"
            name="topicType"
            onChange={(event) => setTopicType(event.target.value)}
            value={topicType}
          >
            {TOPIC_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {errors.topicType ? <FieldError message={errors.topicType} /> : null}
        </div>

        <div className="grid gap-1.5">
          <Input
            error={errors.title}
            label="Title"
            maxLength={TITLE_MAX}
            name="title"
            placeholder="What is the take?"
            required
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        {eligibleClubIds.length > 0 ? (
          <Select
            hint="Choose your FAN club or a team you follow."
            label="Club (optional)"
            name="clubId"
            defaultValue=""
          >
            <option value="">No club — general topic</option>
            <optgroup label="Your clubs (eligible)">
              {clubs
                .filter((club) => eligibleClubIds.includes(club.id))
                .map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name} — {club.leagueName}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Other clubs — FAN/LIKE only">
              {clubs
                .filter((club) => !eligibleClubIds.includes(club.id))
                .map((club) => (
                  <option disabled key={club.id} value={club.id}>
                    {club.name} — {club.leagueName} (not eligible)
                  </option>
                ))}
            </optgroup>
          </Select>
        ) : (
          <div className="grid gap-1.5">
            <span className="text-[13px] font-semibold text-ink">
              Club (optional)
            </span>
            <input name="clubId" type="hidden" value="" />
            <p className="flex items-start gap-2 rounded-md border border-line bg-sunken px-3.5 py-3 text-[13px] leading-6 text-ink-2">
              <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-4" />
              Club topics need a FAN club or a team you follow. You can still
              start a general one.
            </p>
          </div>
        )}
        {errors.club ? <FieldError message={errors.club} /> : null}
      </div>

      <div className="grid gap-1.5">
        <label
          className="grid gap-1.5 text-[13px] font-semibold text-ink"
          htmlFor="topic-body"
        >
          Your take
          <textarea
            className={`${textareaClassName} min-h-24`}
            id="topic-body"
            name="body"
            placeholder="Make the case…"
            required
            rows={3}
          />
        </label>
        {errors.body ? (
          <FieldError message={errors.body} />
        ) : (
          <p className="text-xs leading-5 text-ink-3">
            Say what you think, even when you&apos;re sharing a link.
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Input
          hint={SOURCE_FIELD_HINT}
          inputMode="url"
          label="Source link (optional)"
          name="sourceUrl"
          onChange={(event) => setSourceUrl(event.target.value)}
          placeholder="https://…"
          type="url"
          value={sourceUrl}
        />
        {errors.sourceUrl ? <FieldError message={errors.sourceUrl} /> : null}
        {showUnsourcedWarning ? (
          <p
            className="flex items-start gap-2 rounded-md border border-warn-line bg-warn-wash px-3.5 py-3 text-[13px] leading-6 text-warn"
            role="status"
          >
            <AlertIcon size={15} className="mt-0.5 shrink-0" />
            {UNSOURCED_NEWS_WARNING}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-ink-4">
          Got a source? Drop the link above.
        </p>
        <SubmitButton className="w-full sm:w-fit" pendingLabel="Starting…">
          Start topic
        </SubmitButton>
      </div>
    </ValidatedForm>
  );
}
