"use client";

import Link from "next/link";
import {
  useActionState,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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
import { FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ClubSlotsSelector } from "@/components/onboarding/club-slots-selector";
import { PreferredLanguageSelect } from "@/components/onboarding/preferred-language-select";
import { UsernameField } from "@/components/onboarding/username-field";

type OnboardingFormProps = {
  submitAction?: (
    state: OnboardingActionState,
    data: FormData,
  ) => Promise<OnboardingActionState>;
  clubs: ClubOption[];
};

// Client onboarding form: useActionState keeps every input (username, clubs,
// language, checkboxes) intact when the server returns errors, and an instant
// client preflight surfaces field-level errors before any round trip.
export function OnboardingForm({ clubs, submitAction }: OnboardingFormProps) {
  const [state, formAction] = useActionState<OnboardingActionState, FormData>(
    submitAction ?? completeOnboarding,
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

    for (const prefix of [
      "primary",
      "secondary0",
      "secondary1",
      "secondary2",
    ]) {
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
      nextErrors.acceptedRules =
        "Please accept the community rules to continue.";
    }

    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      className="grid gap-6"
      noValidate
      onSubmit={handleSubmit}
    >
      {state?.formError ? <FormMessage error={state.formError} /> : null}

      <Step
        index={1}
        title="Your name here"
        description="How the crowd finds you."
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <UsernameField
            checkAvailability={!submitAction}
            serverError={errors.username}
          />
          <PreferredLanguageSelect />
        </div>
      </Step>

      <Step
        index={2}
        title="Your club"
        description="Your FAN club is the one you'd defend anywhere. Add the teams you follow too."
      >
        <ClubSlotsSelector
          clubs={clubs}
          primaryError={errors.primaryClub}
          secondaryError={errors.secondaryClubs}
        />
      </Step>

      <Step
        index={3}
        title="Before kick-off"
        description="A few quick checks before you join."
      >
        <div className="grid gap-3">
          <Consent error={errors.is18PlusConfirmed} name="is18PlusConfirmed">
            I confirm that I am 18 or older.
          </Consent>
          <Consent error={errors.acceptedRules} name="acceptedRules">
            I accept the{" "}
            <Link href="/legal/rules" target="_blank" className="underline">
              Community Rules
            </Link>
            .
          </Consent>
          <Consent name="acceptedTerms">
            I agree to the{" "}
            <Link href="/legal/terms" target="_blank" className="underline">
              Terms of Use
            </Link>
            .
          </Consent>
          <Consent name="acknowledgedPrivacy">
            I have read the{" "}
            <Link href="/legal/privacy" target="_blank" className="underline">
              Privacy Notice
            </Link>
            .
          </Consent>
        </div>
      </Step>

      <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-6 text-ink-3">
          You start as a Supporter. Your generation and founding number stay
          with you for good.
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
    <section className="grid gap-4 rounded-lg border border-line bg-surface p-5 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-navy-wash text-[13px] font-bold text-navy">
          {index}
        </span>
        <div className="min-w-0">
          <h2 className="t-section text-ink">{title}</h2>
          <p className="mt-0.5 text-[13px] leading-6 text-ink-3">
            {description}
          </p>
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
        className={`flex items-start gap-3 rounded-md border bg-surface p-3.5 text-[13px] leading-6 text-ink-2 transition-colors hover:border-ink-4 has-[:checked]:border-accent-line has-[:checked]:bg-accent-wash ${
          error ? "border-danger" : "border-line"
        }`}
      >
        <input
          aria-invalid={Boolean(error)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
          name={name}
          type="checkbox"
        />
        <span>{children}</span>
      </label>
      {error ? <FieldError message={error} /> : null}
    </div>
  );
}
