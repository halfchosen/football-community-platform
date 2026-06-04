import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { PublicProfileCard } from "@/components/profile/public-profile-card";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getOwnProfileSummary } from "@/lib/db/queries/profiles";

export default async function AppPage() {
  const { user } = await requireOnboardingComplete();
  const profile = await getOwnProfileSummary(user.id);

  return (
    <AppShell>
      <div className="grid gap-8">
        <header className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
          <div className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
              App shell
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-950">
              Your account foundation
            </h1>
          </div>
          {profile ? (
            <ButtonLink href={`/u/${profile.username}`} variant="secondary">
              View public profile
            </ButtonLink>
          ) : null}
        </header>
        {profile ? (
          <PublicProfileCard profile={profile} />
        ) : (
          <p className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
            Profile data could not be loaded.
          </p>
        )}
      </div>
    </AppShell>
  );
}
