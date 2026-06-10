import type { ReactNode } from "react";
import type {
  ClubOption,
  LeagueOption,
  NationalTeamOption,
} from "@/lib/db/queries/clubs";
import { completeOnboarding } from "@/server/actions/onboarding/complete-onboarding";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ClubSlotsSelector } from "@/components/onboarding/club-slots-selector";
import { NationalTeamSelector } from "@/components/onboarding/national-team-selector";
import { PreferredLanguageSelect } from "@/components/onboarding/preferred-language-select";

type OnboardingFormProps = {
  clubs: ClubOption[];
  leagues: LeagueOption[];
  nationalTeams: NationalTeamOption[];
  error?: string;
};

export function OnboardingForm({
  clubs,
  nationalTeams,
  error,
}: OnboardingFormProps) {
  return (
    <form action={completeOnboarding} className="grid gap-6">
      <FormMessage error={error} />

      <Step
        index={1}
        title="Account"
        description="How the community will know you."
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <Input
            autoComplete="username"
            hint="Lowercase letters, numbers, and underscores."
            label="Username"
            maxLength={24}
            minLength={3}
            name="username"
            pattern="[a-z0-9_]{3,24}"
            placeholder="e.g. marcobaggio"
            required
          />
          <PreferredLanguageSelect />
        </div>
      </Step>

      <Step
        index={2}
        title="Football identity"
        description="Choose the clubs that make up your fan profile."
      >
        <div className="grid gap-5">
          <ClubSlotsSelector clubs={clubs} />
          <NationalTeamSelector nationalTeams={nationalTeams} />
        </div>
      </Step>

      <Step
        index={3}
        title="Confirm"
        description="A couple of quick confirmations before you join."
      >
        <div className="grid gap-3">
          <Consent name="is18PlusConfirmed">
            I confirm that I am 18 or older.
          </Consent>
          <Consent name="acceptedRules">
            I accept the community rules for respectful football discussion.
          </Consent>
        </div>
      </Step>

      <div className="flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">
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
    <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 font-serif text-sm font-bold text-white shadow-sm">
          {index}
        </span>
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-950">{title}</h2>
          <p className="mt-0.5 text-sm text-stone-600">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Consent({ name, children }: { name: string; children: ReactNode }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700 transition hover:border-stone-300 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50/60">
      <input
        className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700"
        name={name}
        required
        type="checkbox"
      />
      <span>{children}</span>
    </label>
  );
}
