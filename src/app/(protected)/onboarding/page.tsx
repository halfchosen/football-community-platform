import { AppShell } from "@/components/layout/app-shell";
import { StatusNotice } from "@/components/ui/status-notice";
import { getMembership, getAdmissionStatus } from "@/lib/community/queries";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getCurrentClubOptions } from "@/lib/db/queries/clubs";
import { requireUser } from "@/lib/auth/guards";
import { getProfileByUserId } from "@/lib/db/queries/profiles";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfileByUserId(user.id);
  const membership = await getMembership(user.id);
  if (
    membership?.state === "frozen" ||
    membership?.state === "deleted" ||
    membership?.state === "suspended"
  )
    redirect("/account/recovery");
  const admission = await getAdmissionStatus(membership?.club_id ?? null);

  if (profile?.onboarding_completed) {
    redirect("/");
  }

  const clubs = await getCurrentClubOptions();

  return (
    <AppShell>
      <section className="mx-auto grid w-full max-w-[1040px] gap-6">
        <header className="grid gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-navy-strong">
            Welcome to the crowd
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Set up your supporter profile
          </h1>
          <p className="max-w-2xl leading-7 text-slate-600">
            Takes about a minute. Choose how you&apos;ll appear to fellow
            supporters — your primary club becomes permanent when your place is
            confirmed.
          </p>
        </header>
        <StatusNotice
          title={
            membership?.state === "waitlisted"
              ? "You’re on the waiting list"
              : "First Generation"
          }
        >
          {" "}
          Up to 1,000 permanent places per club.{" "}
          {membership?.state === "waitlisted"
            ? "You are on the waiting list. Retry below when places become available."
            : "Your place is assigned after email verification and completed onboarding."}
          {membership && admission && (
            <p className="mt-2">
              {admission.remaining} places currently available for your selected
              club.
            </p>
          )}
        </StatusNotice>
        <OnboardingForm clubs={clubs} />
      </section>
    </AppShell>
  );
}
