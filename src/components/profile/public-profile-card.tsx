import type { ProfileSummary } from "@/lib/db/queries/profiles";
import { IdentityBadges } from "@/components/profile/identity-badges";

type PublicProfileCardProps = {
  profile: ProfileSummary;
};

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  return (
    <article className="grid gap-6">
      <header className="grid gap-3 border-b border-stone-200 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
          Public football identity
        </p>
        <div className="grid gap-2">
          <h1 className="font-serif text-4xl font-bold text-stone-950">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="text-stone-600">@{profile.username}</p>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Primary club
          </p>
          <p className="mt-2 text-lg font-semibold text-stone-950">
            {profile.primaryClubName ?? "No club selected"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            National team
          </p>
          <p className="mt-2 text-lg font-semibold text-stone-950">
            {profile.nationalTeamName ?? "Not selected"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Registration year
          </p>
          <p className="mt-2 text-lg font-semibold text-stone-950">
            {profile.registrationYear}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            XP
          </p>
          <p className="mt-2 text-lg font-semibold text-stone-950">
            {profile.xp}
          </p>
        </div>
      </section>
      <IdentityBadges
        generationName={profile.generationName}
        level={profile.level}
        selectedBadgeName={profile.selectedBadgeName}
        titleName={profile.titleName}
      />
      <section className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
        Basic public statistics placeholder. Community activity modules will be added in a later sprint.
      </section>
    </article>
  );
}
