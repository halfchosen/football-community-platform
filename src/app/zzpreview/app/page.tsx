import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { PublicProfileCard } from "@/components/profile/public-profile-card";
import { demoProfile } from "@/app/zzpreview/_mock/data";

// Preview of /app (signed-in home) with the demo profile.
export default function AppPreviewPage() {
  return (
    <AppShell>
      <div className="grid gap-8">
        <header className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
          <div className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
              My profile
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-950">
              Welcome back, {demoProfile.displayName}
            </h1>
          </div>
          <ButtonLink href="/zzpreview/profile" variant="secondary">
            View public profile
          </ButtonLink>
        </header>
        <PublicProfileCard profile={demoProfile} />
      </div>
    </AppShell>
  );
}
