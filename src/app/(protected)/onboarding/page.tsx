import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getCurrentClubOptions } from "@/lib/db/queries/clubs";
import { requireUser } from "@/lib/auth/guards";
import { getProfileByUserId } from "@/lib/db/queries/profiles";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfileByUserId(user.id);

  if (profile?.onboarding_completed) {
    redirect("/");
  }

  const clubs = await getCurrentClubOptions();

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-10 sm:px-6 lg:py-14">
      <header className="grid gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
          ⚽ Welcome — let&apos;s set you up
        </span>
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Set up your supporter profile
        </h1>
        <p className="max-w-2xl leading-7 text-slate-600">
          Takes about a minute. Choose how you&apos;ll appear to fellow
          supporters — you can fine-tune everything later in your settings.
        </p>
      </header>
      <OnboardingForm clubs={clubs} />
    </main>
  );
}
