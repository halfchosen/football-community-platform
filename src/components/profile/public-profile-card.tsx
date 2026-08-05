import type { ProfileSummary } from "@/lib/db/queries/profiles";
import { IdentityBadges } from "@/components/profile/identity-badges";
import { ClubAvatar } from "@/components/onboarding/club-avatar";

type PublicProfileCardProps = {
  profile: ProfileSummary;
};

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const displayName = profile.displayName ?? profile.username;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="relative bg-gradient-to-br from-violet-700 to-violet-900 px-6 pb-6 pt-7 text-white sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-2 border-white" />
          <div className="absolute -right-16 -top-24 h-40 w-40 translate-x-12 translate-y-12 rounded-full border-2 border-white" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
          Supporter profile
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-bold ring-1 ring-white/25">
            {initials(displayName)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold sm:text-4xl">
              {displayName}
            </h1>
            <p className="mt-0.5 text-sm text-violet-100/90">
              @{profile.username}
              {profile.primaryClubName ? ` · ${profile.primaryClubName} fan` : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 p-6 sm:p-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <StatTile label="FAN club">
            <span className="flex items-center gap-2.5">
              {profile.primaryClubName ? (
                <ClubAvatar name={profile.primaryClubName} />
              ) : null}
              <span className="truncate">
                {profile.primaryClubName ?? "No FAN club"}
              </span>
            </span>
          </StatTile>
          <StatTile label="Member since">{profile.registrationYear}</StatTile>
          <StatTile label="XP">{`${profile.xp.toLocaleString()} XP`}</StatTile>
        </section>

        <IdentityBadges
          generationName={profile.generationName}
          level={profile.level}
          selectedBadgeName={profile.selectedBadgeName}
          titleName={profile.titleName}
        />

      </div>
    </article>
  );
}

function StatTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 truncate font-semibold text-slate-900">{children}</p>
    </div>
  );
}

function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/);
  if (words.length === 0 || !words[0]) {
    return "?";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}
