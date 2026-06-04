import type { ClubOption } from "@/lib/db/queries/clubs";
import type { ProfileSummary } from "@/lib/db/queries/profiles";
import { updateProfile } from "@/server/actions/profile/update-profile";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Select } from "@/components/ui/field";
import { ClubSelector } from "@/components/onboarding/club-selector";
import { SupportedClubsSelector } from "@/components/onboarding/supported-clubs-selector";

type ProfileSettingsFormProps = {
  clubs: ClubOption[];
  profile: ProfileSummary;
  secondaryClubIds: string[];
  error?: string;
  message?: string;
};

export function ProfileSettingsForm({
  clubs,
  profile,
  secondaryClubIds,
  error,
  message,
}: ProfileSettingsFormProps) {
  return (
    <form action={updateProfile} className="grid gap-6">
      <FormMessage error={error} message={message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={profile.username}
          label="Username"
          maxLength={24}
          minLength={3}
          name="username"
          pattern="[a-z0-9_]{3,24}"
          required
        />
        <Input
          defaultValue={profile.displayName ?? ""}
          label="Display name"
          name="displayName"
          placeholder="Optional"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ClubSelector clubs={clubs} defaultValue={profile.primaryClubId} />
        <Select
          defaultValue={profile.preferredLanguage}
          label="Interface language"
          name="preferredLanguage"
        >
          <option value="en">English</option>
          <option value="tr">Turkish</option>
          <option value="es">Spanish</option>
          <option value="it">Italian</option>
          <option value="de">German</option>
          <option value="fr">French</option>
        </Select>
      </div>
      <SupportedClubsSelector clubs={clubs} selectedClubIds={secondaryClubIds} />
      <div className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
        Generation, XP, level, title, reputation, and selected badge are managed by the system.
      </div>
      <Button className="w-full sm:w-fit" type="submit">
        Save profile
      </Button>
    </form>
  );
}
