import type { ProfileSummary } from "@/lib/db/queries/profiles";
import { IdentityBadges } from "@/components/profile/identity-badges";
import { ClubAvatar } from "@/components/onboarding/club-avatar";

type PublicProfileCardProps = {
  profile: ProfileSummary;
};

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const displayName = profile.displayName ?? profile.username;

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface">
      <header className="pitch-mark relative bg-navy px-6 py-6 text-white sm:px-8">
        <p className="t-eyebrow text-accent-line">Supporter profile</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/10 text-lg font-bold ring-1 ring-white/20">
            {initials(displayName)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[1.75rem] font-bold leading-tight tracking-[-0.025em] sm:text-[2rem]">
              {displayName}
            </h1>
            <p className="mt-0.5 text-[13px] text-white/65">
              @{profile.username}
              {profile.primaryClubName
                ? ` · ${profile.primaryClubName} fan`
                : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 p-5 sm:p-6">
        <section className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
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
          <StatTile label="Founding place">
            {profile.foundingSeat
              ? `#${String(profile.foundingSeat).padStart(4, "0")}`
              : "Community member"}
          </StatTile>
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
    <div className="bg-surface p-4">
      <p className="t-eyebrow">{label}</p>
      <p className="mt-1.5 truncate text-[14px] font-semibold text-ink">
        {children}
      </p>
    </div>
  );
}

function initials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim()
    .split(/\s+/);
  if (words.length === 0 || !words[0]) {
    return "?";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}
