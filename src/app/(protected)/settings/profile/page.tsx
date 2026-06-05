import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import {
  getCurrentClubOptions,
  getLeagueOptions,
  getNationalTeamOptions,
} from "@/lib/db/queries/clubs";
import {
  getOwnProfileSummary,
  getSecondaryClubIdentities,
} from "@/lib/db/queries/profiles";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type ProfileSettingsPageProps = {
  searchParams: PageSearchParams;
};

export default async function ProfileSettingsPage({
  searchParams,
}: ProfileSettingsPageProps) {
  const { user } = await requireOnboardingComplete();
  const [profile, secondaryClubs, clubs, leagues, nationalTeams] = await Promise.all([
    getOwnProfileSummary(user.id),
    getSecondaryClubIdentities(user.id),
    getCurrentClubOptions(),
    getLeagueOptions(),
    getNationalTeamOptions(),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <AppShell>
      <div className="grid gap-8">
        <header className="grid gap-2 border-b border-stone-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Settings
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-950">
            Edit profile
          </h1>
        </header>
        <ProfileSettingsForm
          clubs={clubs}
          error={await getSearchParam(searchParams, "error")}
          leagues={leagues}
          message={await getSearchParam(searchParams, "message")}
          nationalTeams={nationalTeams}
          profile={profile}
          secondaryClubs={secondaryClubs}
        />
      </div>
    </AppShell>
  );
}
