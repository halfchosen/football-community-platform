import { AppShell } from "@/components/layout/app-shell";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import {
  demoProfile,
  demoSecondaryClubs,
  previewClubs,
} from "@/app/zzpreview/_mock/data";

// Preview of /settings/profile with the demo identity (FAN club unlocked, no
// cooldown). Saving requires a real session, so nothing can be written.
export default function SettingsProfilePreviewPage() {
  return (
    <AppShell previewNav>
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
          clubs={previewClubs}
          fanLocked={false}
          likedCooldownActive={false}
          profile={demoProfile}
          secondaryClubs={demoSecondaryClubs}
        />
      </div>
    </AppShell>
  );
}
