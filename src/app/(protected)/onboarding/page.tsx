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
      <section className="mx-auto grid w-full max-w-[900px] gap-5">
        <header className="on-ground">
          <p className="t-eyebrow">Welcome to the crowd</p>
          <h1 className="mt-2 t-page-title text-ink">Pick your colours</h1>
          <p className="mt-2 max-w-[56ch] text-[13.5px] leading-6 text-ink-3">
            A minute, tops. Your FAN club is permanent once your place is
            confirmed — everything else you can change later.
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
