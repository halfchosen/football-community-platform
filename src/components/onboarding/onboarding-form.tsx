"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import type { ClubOption } from "@/lib/db/queries/clubs";
import {
  completeOnboarding,
  type OnboardingActionState,
} from "@/server/actions/onboarding/complete-onboarding";
import {
  FAN_CLUB_REQUIRED_MESSAGE,
  ONE_CLUB_PER_LEAGUE_MESSAGE,
  USERNAME_FORMAT_MESSAGE,
  USERNAME_PATTERN,
  type ProfileFieldErrors,
} from "@/domains/profile/schemas";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { ClubSlotsSelector } from "@/components/onboarding/club-slots-selector";
import { PreferredLanguageSelect } from "@/components/onboarding/preferred-language-select";
import { UsernameField } from "@/components/onboarding/username-field";

type OnboardingFormProps = {
  clubs: ClubOption[];
};

// Client onboarding form: useActionState keeps every input (username, clubs,
// language, checkboxes) intact when the server returns errors, and an instant
// client preflight surfaces field-level errors before any round trip.
export function OnboardingForm({ clubs }: OnboardingFormProps) {
  const [state, formAction] = useActionState<OnboardingActionState, FormData>(
    completeOnboarding,
    null,
  );
  const [clientErrors, setClientErrors] = useState<ProfileFieldErrors>({});

  const errors: ProfileFieldErrors = {
    ...state?.fieldErrors,
    ...clientErrors,
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const nextErrors: ProfileFieldErrors = {};

    const username = String(formData.get("username") ?? "")
      .trim()
      .toLowerCase();

    if (!USERNAME_PATTERN.test(username)) {
      nextErrors.username = USERNAME_FORMAT_MESSAGE;
    }

    const primaryClubId = String(formData.get("primaryClubId") ?? "");
    const noFanClub = formData.get("primaryNoClub") === "on";

    if (!primaryClubId && !noFanClub) {
      nextErrors.primaryClub = FAN_CLUB_REQUIRED_MESSAGE;
    }

    const seenLeagues = new Set<string>();

    for (const prefix of ["primary", "secondary0", "secondary1", "secondary2"]) {
      const clubValue = String(formData.get(`${prefix}ClubId`) ?? "");
      const leagueValue = String(formData.get(`${prefix}LeagueId`) ?? "");

      if (!clubValue || !leagueValue) {
        continue;
      }

      if (seenLeagues.has(leagueValue)) {
        nextErrors.secondaryClubs = ONE_CLUB_PER_LEAGUE_MESSAGE;
        break;
      }

      seenLeagues.add(leagueValue);
    }

    if (formData.get("is18PlusConfirmed") !== "on") {
      nextErrors.is18PlusConfirmed = "Please confirm that you are 18 or older.";
    }

    if (formData.get("acceptedRules") !== "on") {
      nextErrors.acceptedRules = "Please accept the community rules to continue.";
    }

    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} className="grid gap-6" noValidate onSubmit={handleSubmit}>
      {state?.formError ? <FormMessage error={state.formError} /> : null}

      <Step
        index={1}
        title="Account"
        description="How the community will know you."
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <UsernameField serverError={errors.username} />
          <PreferredLanguageSelect />
        </div>
      </Step>

      <Step
        index={2}
        title="Football identity"
        description="Pick your FAN club — the main club you identify with — and optionally the teams you like or follow."
      >
        <ClubSlotsSelector
          clubs={clubs}
          primaryError={errors.primaryClub}
          secondaryError={errors.secondaryClubs}
        />
      </Step>

      <Step
        index={3}
        title="Confirm"
        description="A couple of quick confirmations before you join."
      >
        <div className="grid gap-3">
          <Consent error={errors.is18PlusConfirmed} name="is18PlusConfirmed">
            I confirm that I am 18 or older.
          </Consent>
          <Consent error={errors.acceptedRules} name="acceptedRules">
            I accept the community rules for respectful football discussion.
          </Consent>
        </div>
      </Step>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          You start at Level&nbsp;1 as a Supporter — your identity grows from
          here.
        </p>
        <SubmitButton
          className="w-full sm:w-fit"
          pendingLabel="Setting up your profile…"
        >
          Join the community
        </SubmitButton>
      </div>
    </form>
  );
}

function Step({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-violet-800 text-sm font-bold text-white shadow-sm">
          {index}
        </span>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-600">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Consent({
  name,
  error,
  children,
}: {
  name: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label
        className={`flex items-start gap-3 rounded-xl border bg-white p-4 text-sm text-slate-700 transition hover:border-slate-300 has-[:checked]:border-violet-300 has-[:checked]:bg-violet-50/60 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        <input
          aria-invalid={Boolean(error)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-violet-700"
          name={name}
          type="checkbox"
        />
        <span>{children}</span>
      </label>
      {error ? (
        <p className="flex items-start gap-1.5 text-sm text-red-700" role="alert">
          <span aria-hidden>⚠️</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
