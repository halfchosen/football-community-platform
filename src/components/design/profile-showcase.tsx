"use client";

import { useState } from "react";
import { Crest } from "@/components/design/crest";
import { LevelRing } from "@/components/design/level-ring";
import {
  RARITY_STYLES,
  TITLE_LADDER,
  freshProfile,
  populatedProfile,
  type Badge,
  type FanProfile,
} from "@/components/design/mock-data";

type StateKey = "populated" | "fresh";

export function ProfileShowcase() {
  const [state, setState] = useState<StateKey>("populated");
  const profile = state === "populated" ? populatedProfile : freshProfile;

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-stone-900">
      <ShowcaseHeader state={state} onChange={setState} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <ProfileHero profile={profile} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-6">
            <ProgressionCard profile={profile} />
            <BadgesCard badges={profile.badges} />
          </div>
          <div className="grid gap-6">
            <ClubsCard profile={profile} />
            <AboutCard profile={profile} />
          </div>
        </div>
      </main>
    </div>
  );
}

function ShowcaseHeader({
  state,
  onChange,
}: {
  state: StateKey;
  onChange: (next: StateKey) => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-[#f7f3e8]/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-lg text-white shadow-sm">
            ⚽
          </span>
          <span className="font-serif text-lg font-bold text-emerald-950">
            Football Community
          </span>
        </div>
        <nav className="hidden items-center gap-1 text-sm font-medium text-stone-600 md:flex">
          <span className="rounded-lg bg-emerald-700/10 px-3 py-2 text-emerald-900">
            Profile
          </span>
          <span className="rounded-lg px-3 py-2">Clubs</span>
          <span className="rounded-lg px-3 py-2">Badges</span>
        </nav>
        <div className="flex items-center gap-1 rounded-full border border-emerald-900/15 bg-white p-1 text-xs font-semibold shadow-sm">
          <ToggleButton
            active={state === "populated"}
            onClick={() => onChange("populated")}
          >
            Populated
          </ToggleButton>
          <ToggleButton
            active={state === "fresh"}
            onClick={() => onChange("fresh")}
          >
            New user
          </ToggleButton>
        </div>
      </div>
    </header>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 transition ${
        active
          ? "bg-emerald-700 text-white shadow-sm"
          : "text-stone-500 hover:text-stone-800"
      }`}
    >
      {children}
    </button>
  );
}

function ProfileHero({ profile }: { profile: FanProfile }) {
  const club = profile.primaryClub;
  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm">
      <div
        className="relative h-40 sm:h-52"
        style={{
          backgroundImage: `linear-gradient(125deg, ${club.colors[0]}, ${club.colors[1]})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <Crest club={club} size="sm" />
          {club.shortName} supporter
        </span>
      </div>

      <div className="px-5 pb-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="-mt-12 grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-4 border-white bg-emerald-950 font-serif text-3xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
              {profile.avatarInitials}
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-3xl font-bold text-stone-950">
                  {profile.displayName}
                </h1>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-500 text-[11px] text-white">
                  ✓
                </span>
              </div>
              <p className="mt-0.5 text-stone-500">@{profile.username}</p>
            </div>
          </div>
          <div className="flex gap-2.5 pb-1">
            <button
              type="button"
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Follow
            </button>
            <button
              type="button"
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
            >
              Share
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <span>{profile.countryFlag}</span>
            {profile.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            🗓️ Member since {profile.memberSince}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
            🏅 {profile.generation}
          </span>
        </div>
      </div>
    </section>
  );
}

function ProgressionCard({ profile }: { profile: FanProfile }) {
  const progress =
    profile.xpForNextLevel > 0 ? profile.xpIntoLevel / profile.xpForNextLevel : 0;
  const remaining = Math.max(0, profile.xpForNextLevel - profile.xpIntoLevel);
  const nextTitle = TITLE_LADDER.find((t) => t.level === profile.level + 1);

  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <SectionTitle>Progression</SectionTitle>
        <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-800">
          {profile.title}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <LevelRing level={profile.level} progress={progress} />
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-950">
              {profile.xpTotal.toLocaleString()} XP
            </span>
            <span className="text-sm text-stone-500">
              {profile.level >= 10
                ? "Max level reached"
                : `${remaining.toLocaleString()} XP to Level ${profile.level + 1}`}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-emerald-900/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-[width] duration-700"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-stone-500">
            {nextTitle
              ? `Next title: ${nextTitle.title}`
              : "Top of the title ladder"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Title ladder
        </p>
        <ol className="flex flex-wrap gap-2">
          {TITLE_LADDER.map((entry) => {
            const reached = profile.level >= entry.level;
            const current = profile.level === entry.level;
            return (
              <li
                key={entry.level}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  current
                    ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                    : reached
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-stone-200 bg-stone-50 text-stone-400"
                }`}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold ${
                    current
                      ? "bg-white text-emerald-700"
                      : reached
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {entry.level}
                </span>
                {entry.title}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function BadgesCard({ badges }: { badges: Badge[] }) {
  const unlocked = badges.filter((b) => b.unlocked);

  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <SectionTitle>Badge cabinet</SectionTitle>
        <span className="text-sm text-stone-500">
          {unlocked.length}/{badges.length} earned
        </span>
      </div>

      {unlocked.length === 0 ? (
        <div className="mt-5 grid place-items-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-stone-200 text-2xl">
            🏆
          </span>
          <p className="mt-3 font-semibold text-stone-700">No badges yet</p>
          <p className="mt-1 max-w-xs text-sm text-stone-500">
            Earn your first badge by completing onboarding and joining the
            community. Locked badges below show what is up for grabs.
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => (
          <BadgeTile key={badge.id} badge={badge} />
        ))}
      </div>
    </section>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  const rarity = RARITY_STYLES[badge.rarity];
  return (
    <div
      className={`group relative flex flex-col items-center gap-2 rounded-2xl border border-stone-200 p-4 text-center transition ${
        badge.unlocked ? "bg-white hover:shadow-md" : "bg-stone-50"
      }`}
    >
      <span
        className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br text-2xl ring-2 ${rarity.glow} ${rarity.ring} ${
          badge.unlocked ? "" : "opacity-40 grayscale"
        }`}
      >
        {badge.unlocked ? badge.icon : "🔒"}
      </span>
      <p
        className={`text-sm font-semibold ${
          badge.unlocked ? "text-stone-900" : "text-stone-500"
        }`}
      >
        {badge.name}
      </p>
      <span className={`text-[11px] font-semibold uppercase tracking-wide ${rarity.text}`}>
        {rarity.label}
      </span>
      <p className="text-[11px] leading-snug text-stone-400">{badge.description}</p>
    </div>
  );
}

function ClubsCard({ profile }: { profile: FanProfile }) {
  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <SectionTitle>Football identity</SectionTitle>

      <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-stone-50 to-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Primary club
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Crest club={profile.primaryClub} size="lg" />
          <div>
            <p className="font-serif text-xl font-bold text-stone-950">
              {profile.primaryClub.name}
            </p>
            <p className="text-sm text-stone-500">{profile.primaryClub.league}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Secondary clubs
        </p>
        {profile.secondaryClubs.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {profile.secondaryClubs.map((club) => (
              <li
                key={club.name}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5"
              >
                <Crest club={club} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">
                    {club.name}
                  </p>
                  <p className="truncate text-xs text-stone-500">{club.league}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-center text-sm text-stone-500">
            No secondary clubs added yet.
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          National team
        </p>
        {profile.nationalTeam ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-lg">
              {profile.nationalTeam.flag}
            </span>
            <p className="font-semibold text-stone-900">
              {profile.nationalTeam.name}
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-center text-sm text-stone-500">
            Not selected.
          </div>
        )}
      </div>
    </section>
  );
}

function AboutCard({ profile }: { profile: FanProfile }) {
  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <SectionTitle>About</SectionTitle>
      {profile.bio ? (
        <p className="mt-3 leading-relaxed text-stone-700">{profile.bio}</p>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
          This supporter hasn&apos;t written a bio yet.
        </div>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Generation" value={profile.generation} />
        <Stat label="Title" value={profile.title} />
        <Stat label="Level" value={`Level ${profile.level}`} />
        <Stat label="Total XP" value={profile.xpTotal.toLocaleString()} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </dt>
      <dd className="mt-1 font-serif text-base font-bold text-emerald-950">
        {value}
      </dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-lg font-bold text-stone-950">{children}</h2>
  );
}
