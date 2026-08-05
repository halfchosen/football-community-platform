"use client";

import { useActionState, useState } from "react";
import type { ClubOption } from "@/lib/db/queries/clubs";
import {
  createTopic,
  type CreateTopicActionState,
} from "@/server/actions/forum/create-topic";
import {
  BODY_MIN,
  isNewsLikeType,
  SOURCE_FIELD_HINT,
  TITLE_MAX,
  TOPIC_TYPES,
  UNSOURCED_NEWS_WARNING,
} from "@/domains/forum/topics";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Select, inputClassName } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

type TopicFormProps = {
  /** Catalog clubs for the optional club association. */
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
export function TopicForm({ clubs, eligibleClubIds }: TopicFormProps) {
  const [state, formAction] = useActionState<CreateTopicActionState, FormData>(
    createTopic,
    null,
  );
  const [topicType, setTopicType] = useState<string>("general");
  const [sourceUrl, setSourceUrl] = useState("");

  const showUnsourcedWarning =
    isNewsLikeType(topicType) && sourceUrl.trim().length === 0;
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state?.formError ? (
        <FormMessage error={state.formError} />
      ) : null}

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
            label="Title"
            maxLength={TITLE_MAX}
            name="title"
            placeholder="A clear, specific headline for your topic"
            required
          />
          {errors.title ? <FieldError message={errors.title} /> : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        {eligibleClubIds.length > 0 ? (
          <Select
            hint="Club topics are limited to your FAN club and teams you like/follow. Guests of a club topic have a daily comment limit."
            label="Club (optional)"
            name="clubId"
            defaultValue=""
          >
            <option value="">No club — general discussion</option>
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
            <span className="text-sm font-medium text-slate-800">
              Club (optional)
            </span>
            <input name="clubId" type="hidden" value="" />
            <p className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-relaxed text-slate-600">
              <span aria-hidden className="mt-px">ℹ️</span>
              You need a FAN club or a team you like/follow to create a
              club-specific topic. You can still start a general topic.
            </p>
          </div>
        )}
        {errors.club ? <FieldError message={errors.club} /> : null}
      </div>

      <div className="grid gap-1.5">
        <label
          className="grid gap-1.5 text-sm font-medium text-slate-800"
          htmlFor="topic-body"
        >
          Your commentary
          <textarea
            className={`${inputClassName} min-h-44 resize-y py-3 leading-relaxed`}
            id="topic-body"
            name="body"
            placeholder={`What do you think? Write at least ${BODY_MIN} characters of your own take — link-only topics aren't allowed.`}
            required
            rows={7}
          />
        </label>
        {errors.body ? (
          <FieldError message={errors.body} />
        ) : (
          <p className="text-xs leading-relaxed text-slate-500">
            Your own words are required even when you link a source.
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
            className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
            role="status"
          >
            <span aria-hidden className="mt-px">⚠️</span>
            {UNSOURCED_NEWS_WARNING}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-400">
          Text and source links only — image uploads are not part of topics.
        </p>
        <SubmitButton className="w-full sm:w-fit" pendingLabel="Publishing…">
          Publish topic
        </SubmitButton>
      </div>
    </form>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-1.5 text-sm text-red-700" role="alert">
      <span aria-hidden>⚠️</span>
      {message}
    </p>
  );
}
