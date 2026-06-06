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
    <main className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-10 sm:px-6 lg:py-14">
      <header className="grid gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          ⚽ Welcome — let&apos;s set you up
        </span>
        <h1 className="font-serif text-4xl font-bold text-stone-950 sm:text-5xl">
          Set your football identity
        </h1>
        <p className="max-w-2xl leading-7 text-stone-600">
          Just a minute to go. Your club, generation, level, title, and badge are
          separate parts of your visible profile — you can refine them anytime.
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
