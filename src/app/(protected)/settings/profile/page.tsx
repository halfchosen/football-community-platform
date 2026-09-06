import { redirect } from "next/navigation";
import { MemberShell } from "@/components/community/member-shell";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getCurrentClubOptions } from "@/lib/db/queries/clubs";
import {
  getOwnProfileSummary,
  getSecondaryClubIdentities,
} from "@/lib/db/queries/profiles";
import { isLikedClubsCooldownActive } from "@/domains/profile/schemas";

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

  const fanLocked = true;
  const likedCooldownActive = isLikedClubsCooldownActive(
    profile.likedClubsUpdatedAt,
  );

  return (
    <MemberShell
      title="Football identity"
      description="Choose how you appear in the crowd."
      active="/settings/profile"
    >
      <div className="settings-section">
        <ProfileSettingsForm
          clubs={clubs}
          fanLocked={fanLocked}
          likedCooldownActive={likedCooldownActive}
          profile={profile}
          secondaryClubs={secondaryClubs}
        />
      </div>
    </MemberShell>
  );
}
