import { getLocalClubOptions } from "@/data/football-leagues";
import type {
  ProfileSummary,
  SecondaryClubIdentity,
} from "@/lib/db/queries/profiles";

// Demo data for the local-only preview hub. Read-only: nothing here touches
// Supabase, and no preview page performs mutations.

export const previewClubs = getLocalClubOptions();

function findClub(nameFragment: string) {
  const needle = nameFragment.toLowerCase();
  return (
    previewClubs.find((club) => club.name.toLowerCase().includes(needle)) ??
    previewClubs[0]
  );
}

const juventus = findClub("juventus");
const liverpool = findClub("liverpool");
const galatasaray = findClub("galatasaray");
const barcelona = findClub("barcelona");

export const DEMO_EMAIL = "demo_user@example.com";

export const demoProfile: ProfileSummary = {
  id: "00000000-0000-0000-0000-000000000000",
  username: "demo_user",
  displayName: "Demo User",
  preferredLanguage: "en",
  onboardingCompleted: true,
  primaryClubId: juventus.id,
  primaryClubSuggestionId: null,
  primaryClubName: juventus.name,
  nationalTeamId: null,
  nationalTeamSuggestionId: null,
  nationalTeamName: null,
  generationName: "First Generation Writer",
  level: 1,
  xp: 0,
  titleName: "Supporter",
  selectedBadgeName: "Founder Preview",
  registrationYear: new Date().getFullYear(),
  fanClubSelectedAt: null,
  likedClubsUpdatedAt: null,
};

export const demoSecondaryClubs: SecondaryClubIdentity[] = [
  { clubId: liverpool.id, clubSuggestionId: null, displayName: liverpool.name },
  {
    clubId: galatasaray.id,
    clubSuggestionId: null,
    displayName: galatasaray.name,
  },
  { clubId: barcelona.id, clubSuggestionId: null, displayName: barcelona.name },
];
