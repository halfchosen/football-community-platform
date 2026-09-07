"use client";

import { useActionState, useState } from "react";
import type { ClubOption } from "@/lib/db/queries/clubs";
import type {
  ProfileSummary,
  SecondaryClubIdentity,
} from "@/lib/db/queries/profiles";
import {
  updateProfile,
  type ProfileSettingsActionState,
} from "@/server/actions/profile/update-profile";
import { ValidatedForm } from "@/components/ui/validated-form";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ClubSlotsSelector } from "@/components/onboarding/club-slots-selector";
import { PreferredLanguageSelect } from "@/components/onboarding/preferred-language-select";
import { InfoIcon } from "@/components/ui/icons";

type ProfileSettingsFormProps = {
  submitAction?: (
    state: ProfileSettingsActionState,
    data: FormData,
  ) => Promise<ProfileSettingsActionState>;
  clubs: ClubOption[];
  profile: ProfileSummary;
  secondaryClubs: SecondaryClubIdentity[];
  /** Computed server-side: primary club identity is locked. */
  fanLocked: boolean;
  /** Computed server-side: liked clubs are inside the 21-day cooldown. */
  likedCooldownActive: boolean;
};

// Controlled identity fields survive the form reset after an action resolves,
// including validation errors. Club editability is supplied by the server.
export function ProfileSettingsForm({
  clubs,
  profile,
  secondaryClubs,
  submitAction,
  fanLocked,
  likedCooldownActive,
}: ProfileSettingsFormProps) {
  const [state, formAction] = useActionState<
    ProfileSettingsActionState,
    FormData
  >(submitAction ?? updateProfile, null);

  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");

  const hasNoFanClub =
    !profile.primaryClubId && !profile.primaryClubSuggestionId;

  return (
    <ValidatedForm action={formAction} className="grid gap-8" noValidate>
      {state?.formError ? <FormMessage error={state.formError} /> : null}
      {state?.success ? <FormMessage message="Profile updated." /> : null}

      <div className="grid gap-2">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <Input
            error={state?.fieldErrors?.username}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            label="Username"
            maxLength={24}
            minLength={3}
            name="username"
            pattern="[a-z0-9_]{3,24}"
            required
          />
          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            label="Display name"
            name="displayName"
            placeholder="Optional"
          />
        </div>
      </div>

      <PreferredLanguageSelect defaultValue={profile.preferredLanguage} />

      <div className="grid gap-3">
        <h2 className="t-section text-ink">Football identity</h2>
        <ClubSlotsSelector
          clubs={clubs}
          defaultNoFanClub={hasNoFanClub}
          defaultPrimaryClubId={profile.primaryClubId}
          defaultPrimarySuggestionName={
            profile.primaryClubSuggestionId ? profile.primaryClubName : null
          }
          defaultSecondaryClubs={secondaryClubs}
          fanLocked={fanLocked}
          likedCooldownActive={likedCooldownActive}
          primaryError={state?.fieldErrors?.primaryClub}
          secondaryError={state?.fieldErrors?.secondaryClubs}
        />
      </div>

      <p className="flex items-start gap-2 rounded-md border border-line bg-sunken p-3.5 text-[13px] leading-6 text-ink-2">
        <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-4" />
        Your generation is permanent, and writer status is earned through
        contributions — neither can be edited here.
      </p>

      <SubmitButton className="w-full sm:w-fit" pendingLabel="Saving…">
        Save profile
      </SubmitButton>
    </ValidatedForm>
  );
}
