import type { ClubOption } from "@/lib/db/queries/clubs";
import { completeOnboarding } from "@/server/actions/onboarding/complete-onboarding";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Select } from "@/components/ui/field";
import { ClubSelector } from "@/components/onboarding/club-selector";
import { SupportedClubsSelector } from "@/components/onboarding/supported-clubs-selector";

type OnboardingFormProps = {
  clubs: ClubOption[];
  error?: string;
};

export function OnboardingForm({ clubs, error }: OnboardingFormProps) {
  return (
    <form action={completeOnboarding} className="grid gap-6">
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
        <Input
          autoComplete="nickname"
          label="Display name"
          name="displayName"
          placeholder="Optional"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ClubSelector clubs={clubs} />
        <Select defaultValue="en" label="Interface language" name="preferredLanguage">
          <option value="en">English</option>
          <option value="tr">Turkish</option>
          <option value="es">Spanish</option>
          <option value="it">Italian</option>
          <option value="de">German</option>
          <option value="fr">French</option>
        </Select>
      </div>
      <SupportedClubsSelector clubs={clubs} />
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
