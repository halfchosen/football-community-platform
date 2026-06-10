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
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ClubSlotsSelector } from "@/components/onboarding/club-slots-selector";
import { NationalTeamSelector } from "@/components/onboarding/national-team-selector";
import { PreferredLanguageSelect } from "@/components/onboarding/preferred-language-select";

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
  nationalTeams,
  profile,
  secondaryClubs,
  error,
  message,
}: ProfileSettingsFormProps) {
  return (
    <form action={updateProfile} className="grid gap-8">
      <FormMessage error={error} message={message} />
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
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
      <ClubSlotsSelector
        clubs={clubs}
        defaultPrimaryClubId={profile.primaryClubId}
        defaultPrimarySuggestionName={
          profile.primaryClubSuggestionId ? profile.primaryClubName : null
        }
        defaultSecondaryClubs={secondaryClubs}
      />
      <NationalTeamSelector
        defaultNationalTeamId={profile.nationalTeamId}
        defaultSuggestionName={
          profile.nationalTeamSuggestionId ? profile.nationalTeamName : null
        }
        nationalTeams={nationalTeams}
      />
      <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-4 text-sm text-stone-600">
        <span aria-hidden>🏅</span>
        <span>
          Your generation, level, title, and badges are earned through community
          activity, so they can&apos;t be edited here.
        </span>
      </div>
      <SubmitButton className="w-full sm:w-fit" pendingLabel="Saving…">
        Save profile
      </SubmitButton>
    </form>
  );
}
