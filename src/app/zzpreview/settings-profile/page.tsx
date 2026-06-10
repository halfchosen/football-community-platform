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
