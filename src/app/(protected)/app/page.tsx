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
              My profile
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-950">
              Welcome back{profile ? `, ${profile.displayName ?? profile.username}` : ""}
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
            We couldn&apos;t load your profile. Please refresh the page or try
            again in a moment.
          </p>
        )}
      </div>
    </AppShell>
  );
}
