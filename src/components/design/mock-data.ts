// Design-only mock data. Frontend showcase for the Sprint 1 profile / football
// identity module. No database, auth, or Supabase access here — purely static
// content used to demonstrate the redesigned UI in populated and empty states.

export type ClubIdentity = {
  name: string;
  shortName: string;
  initials: string;
  /** Tailwind gradient stops for the crest, e.g. ["#1d4ed8", "#0b1f6b"]. */
  colors: [string, string];
  league?: string;
};

export type NationalTeam = {
  name: string;
  flag: string;
};

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlocked: boolean;
};

export type FanProfile = {
  username: string;
  displayName: string;
  avatarInitials: string;
  location: string;
  countryFlag: string;
  memberSince: number;
  generation: string;
  level: number;
  title: string;
  xpTotal: number;
  /** XP accumulated inside the current level. */
  xpIntoLevel: number;
  /** XP required to clear the current level. */
  xpForNextLevel: number;
  bio: string | null;
  primaryClub: ClubIdentity;
  nationalTeam: NationalTeam | null;
  secondaryClubs: ClubIdentity[];
  badges: Badge[];
};

export const TITLE_LADDER = [
  { level: 1, title: "Supporter" },
  { level: 2, title: "New Writer" },
  { level: 3, title: "Contributor" },
  { level: 4, title: "Writer" },
  { level: 5, title: "Active Writer" },
  { level: 6, title: "Senior Writer" },
  { level: 7, title: "Lead Writer" },
  { level: 8, title: "Community Leader" },
  { level: 9, title: "Club Voice" },
  { level: 10, title: "Club Legend" },
] as const;

export const RARITY_STYLES: Record<
  BadgeRarity,
  { label: string; ring: string; text: string; glow: string }
> = {
  common: {
    label: "Common",
    ring: "ring-stone-300",
    text: "text-stone-600",
    glow: "from-stone-100 to-stone-200",
  },
  rare: {
    label: "Rare",
    ring: "ring-sky-300",
    text: "text-sky-700",
    glow: "from-sky-100 to-sky-200",
  },
  epic: {
    label: "Epic",
    ring: "ring-violet-300",
    text: "text-violet-700",
    glow: "from-violet-100 to-violet-200",
  },
  legendary: {
    label: "Legendary",
    ring: "ring-amber-300",
    text: "text-amber-700",
    glow: "from-amber-100 to-amber-200",
  },
};

const liverpool: ClubIdentity = {
  name: "Liverpool FC",
  shortName: "Liverpool",
  initials: "LFC",
  colors: ["#e11d48", "#7f1d1d"],
  league: "Premier League",
};

const realMadrid: ClubIdentity = {
  name: "Real Madrid",
  shortName: "Real Madrid",
  initials: "RM",
  colors: ["#1d4ed8", "#0b1f6b"],
  league: "LaLiga EA Sports",
};

const napoli: ClubIdentity = {
  name: "SSC Napoli",
  shortName: "Napoli",
  initials: "SSC",
  colors: ["#0ea5e9", "#0369a1"],
  league: "Serie A",
};

const dortmund: ClubIdentity = {
  name: "Borussia Dortmund",
  shortName: "Dortmund",
  initials: "BVB",
  colors: ["#facc15", "#a16207"],
  league: "Bundesliga",
};

export const populatedProfile: FanProfile = {
  username: "marcobaggio",
  displayName: "Marco Baggio",
  avatarInitials: "MB",
  location: "Turin, Italy",
  countryFlag: "🇮🇹",
  memberSince: 2021,
  generation: "First Generation Writer",
  level: 6,
  title: "Senior Writer",
  xpTotal: 12480,
  xpIntoLevel: 640,
  xpForNextLevel: 1000,
  bio: "Tifoso since the Del Piero era. Writing about tactics, transfers, and the away days that make it all worth it.",
  primaryClub: liverpool,
  nationalTeam: { name: "Italy", flag: "🇮🇹" },
  secondaryClubs: [napoli, dortmund],
  badges: [
    {
      id: "founder",
      name: "Founding Supporter",
      description: "Joined during the first launch season.",
      icon: "🛡️",
      rarity: "legendary",
      unlocked: true,
    },
    {
      id: "first-post",
      name: "First Whistle",
      description: "Published a first community entry.",
      icon: "✍️",
      rarity: "common",
      unlocked: true,
    },
    {
      id: "streak",
      name: "Matchday Regular",
      description: "Active 30 days in a row.",
      icon: "🔥",
      rarity: "rare",
      unlocked: true,
    },
    {
      id: "liked",
      name: "Crowd Favourite",
      description: "Received 100 likes from the community.",
      icon: "❤️",
      rarity: "epic",
      unlocked: true,
    },
    {
      id: "derby",
      name: "Derby Day",
      description: "Posted during a rivalry weekend.",
      icon: "⚔️",
      rarity: "rare",
      unlocked: false,
    },
    {
      id: "legend",
      name: "Club Legend",
      description: "Reach Level 10.",
      icon: "👑",
      rarity: "legendary",
      unlocked: false,
    },
  ],
};

export const freshProfile: FanProfile = {
  username: "newfan",
  displayName: "New Fan",
  avatarInitials: "NF",
  location: "—",
  countryFlag: "🏳️",
  memberSince: 2026,
  generation: "Sixth Generation Writer",
  level: 1,
  title: "Supporter",
  xpTotal: 0,
  xpIntoLevel: 0,
  xpForNextLevel: 250,
  bio: null,
  primaryClub: realMadrid,
  nationalTeam: null,
  secondaryClubs: [],
  badges: [
    {
      id: "first-post",
      name: "First Whistle",
      description: "Publish your first community entry.",
      icon: "✍️",
      rarity: "common",
      unlocked: false,
    },
    {
      id: "streak",
      name: "Matchday Regular",
      description: "Stay active 30 days in a row.",
      icon: "🔥",
      rarity: "rare",
      unlocked: false,
    },
    {
      id: "liked",
      name: "Crowd Favourite",
      description: "Receive 100 likes from the community.",
      icon: "❤️",
      rarity: "epic",
      unlocked: false,
    },
    {
      id: "legend",
      name: "Club Legend",
      description: "Reach Level 10.",
      icon: "👑",
      rarity: "legendary",
      unlocked: false,
    },
  ],
};
