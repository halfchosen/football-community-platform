import type {
  ClubOption,
  LeagueOption,
  NationalTeamOption,
} from "@/lib/db/queries/clubs";
import { completeOnboarding } from "@/server/actions/onboarding/complete-onboarding";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { NationalTeamSelector } from "@/components/onboarding/national-team-selector";
import { PreferredLanguageSelect } from "@/components/onboarding/preferred-language-select";
import { PrimaryClubSelector } from "@/components/onboarding/primary-club-selector";
import { SecondaryClubsSelector } from "@/components/onboarding/secondary-clubs-selector";

type OnboardingFormProps = {
  clubs: ClubOption[];
  leagues: LeagueOption[];
  nationalTeams: NationalTeamOption[];
  error?: string;
};

export function OnboardingForm({
  clubs,
  leagues,
  nationalTeams,
  error,
}: OnboardingFormProps) {
  return (
    <form action={completeOnboarding} className="grid gap-8">
      <FormMessage error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          autoComplete="username"
          hint="Lowercase letters, numbers, and underscores."
          label="Username"
          maxLength={24}
          minLength={3}
          name="username"
          pattern="[a-z0-9_]{3,24}"
          required
        />
        <PreferredLanguageSelect />
      </div>
      <PrimaryClubSelector clubs={clubs} leagues={leagues} />
      <SecondaryClubsSelector clubs={clubs} leagues={leagues} />
      <NationalTeamSelector nationalTeams={nationalTeams} />
      <div className="grid gap-3 rounded-md border border-stone-200 bg-white p-4">
        <label className="flex items-start gap-3 text-sm text-stone-700">
          <input className="mt-1" name="is18PlusConfirmed" required type="checkbox" />
          <span>I confirm that I am 18 or older.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-stone-700">
          <input className="mt-1" name="acceptedRules" required type="checkbox" />
          <span>I accept the community rules for respectful football discussion.</span>
        </label>
      </div>
      <Button className="w-full sm:w-fit" type="submit">
        Complete onboarding
      </Button>
    </form>
  );
}
