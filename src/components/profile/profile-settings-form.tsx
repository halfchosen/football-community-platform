import type {
  ClubOption,
  LeagueOption,
  NationalTeamOption,
} from "@/lib/db/queries/clubs";
import type {
  ProfileSummary,
  SecondaryClubIdentity,
} from "@/lib/db/queries/profiles";
import { updateProfile } from "@/server/actions/profile/update-profile";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { NationalTeamSelector } from "@/components/onboarding/national-team-selector";
import { PreferredLanguageSelect } from "@/components/onboarding/preferred-language-select";
import { PrimaryClubSelector } from "@/components/onboarding/primary-club-selector";
import { SecondaryClubsSelector } from "@/components/onboarding/secondary-clubs-selector";

type ProfileSettingsFormProps = {
  clubs: ClubOption[];
  leagues: LeagueOption[];
  nationalTeams: NationalTeamOption[];
  profile: ProfileSummary;
  secondaryClubs: SecondaryClubIdentity[];
  error?: string;
  message?: string;
};

export function ProfileSettingsForm({
  clubs,
  leagues,
  nationalTeams,
  profile,
  secondaryClubs,
  error,
  message,
}: ProfileSettingsFormProps) {
  return (
    <form action={updateProfile} className="grid gap-8">
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
      <PreferredLanguageSelect defaultValue={profile.preferredLanguage} />
      <PrimaryClubSelector
        clubs={clubs}
        defaultClubId={profile.primaryClubId}
        defaultSuggestionName={
          profile.primaryClubSuggestionId ? profile.primaryClubName : null
        }
        leagues={leagues}
      />
      <SecondaryClubsSelector
        clubs={clubs}
        leagues={leagues}
        selectedClubs={secondaryClubs}
      />
      <NationalTeamSelector
        defaultNationalTeamId={profile.nationalTeamId}
        defaultSuggestionName={
          profile.nationalTeamSuggestionId ? profile.nationalTeamName : null
        }
        nationalTeams={nationalTeams}
      />
      <div className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
        Generation, XP, level, title, reputation, and selected badge are managed by the system.
      </div>
      <Button className="w-full sm:w-fit" type="submit">
        Save profile
      </Button>
    </form>
  );
}
