import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import {
  getCurrentClubOptions,
  getLeagueOptions,
  getNationalTeamOptions,
} from "@/lib/db/queries/clubs";
import { requireUser } from "@/lib/auth/guards";
import { getProfileByUserId } from "@/lib/db/queries/profiles";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type OnboardingPageProps = {
  searchParams: PageSearchParams;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const user = await requireUser();
  const profile = await getProfileByUserId(user.id);

  if (profile?.onboarding_completed) {
    redirect("/app");
  }

  const [clubs, leagues, nationalTeams] = await Promise.all([
    getCurrentClubOptions(),
    getLeagueOptions(),
    getNationalTeamOptions(),
  ]);

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-10 sm:px-6">
      <header className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
          Onboarding
        </p>
        <h1 className="font-serif text-4xl font-bold text-stone-950">
          Set your football identity
        </h1>
        <p className="max-w-2xl text-stone-600">
          Your club, generation, level, title, and selected badge are separate
          parts of your visible profile.
        </p>
      </header>
      <OnboardingForm
        clubs={clubs}
        error={await getSearchParam(searchParams, "error")}
        leagues={leagues}
        nationalTeams={nationalTeams}
      />
    </main>
  );
}
