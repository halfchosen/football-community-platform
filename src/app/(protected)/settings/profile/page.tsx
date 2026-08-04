import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getCurrentClubOptions } from "@/lib/db/queries/clubs";
import {
  getOwnProfileSummary,
  getSecondaryClubIdentities,
} from "@/lib/db/queries/profiles";
import {
  isFanClubLocked,
  isLikedClubsCooldownActive,
} from "@/domains/profile/schemas";

export default async function ProfileSettingsPage() {
  const { user } = await requireOnboardingComplete();
  const [profile, secondaryClubs, clubs] = await Promise.all([
    getOwnProfileSummary(user.id),
    getSecondaryClubIdentities(user.id),
    getCurrentClubOptions(),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  const fanLocked = isFanClubLocked(profile.fanClubSelectedAt);
  const likedCooldownActive = isLikedClubsCooldownActive(
    profile.likedClubsUpdatedAt,
  );

  return (
    <AppShell>
      <div className="grid gap-8">
        <header className="grid gap-2 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
            Settings
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Edit profile
          </h1>
        </header>
        <ProfileSettingsForm
          clubs={clubs}
          fanLocked={fanLocked}
          likedCooldownActive={likedCooldownActive}
          profile={profile}
          secondaryClubs={secondaryClubs}
        />
      </div>
    </AppShell>
  );
}
