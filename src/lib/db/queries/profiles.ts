import { createClient } from "@/lib/supabase/server";

export type ProfileSummary = {
  id: string;
  username: string;
  displayName: string | null;
  preferredLanguage: string;
  onboardingCompleted: boolean;
  primaryClubId: string | null;
  primaryClubName: string | null;
  generationName: string | null;
  level: number;
  xp: number;
  titleName: string | null;
  selectedBadgeName: string | null;
  registrationYear: number;
};

export async function getProfileByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, username, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export async function getOwnProfileSummary(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `
      id,
      username,
      display_name,
      preferred_language,
      onboarding_completed,
      primary_club_id,
      registration_year,
      level,
      xp,
      clubs(name),
      generations(name),
      titles(name),
      badges(name)
    `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfileSummary(data as unknown as ProfileQueryRow);
}

export async function getPublicProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `
      id,
      username,
      display_name,
      preferred_language,
      onboarding_completed,
      primary_club_id,
      registration_year,
      level,
      xp,
      clubs(name),
      generations(name),
      titles(name),
      badges(name)
    `,
    )
    .eq("username", username.toLowerCase())
    .eq("onboarding_completed", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfileSummary(data as unknown as ProfileQueryRow);
}

export async function getSecondaryClubIds(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_supported_clubs")
    .select("club_id")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.club_id);
}

type ProfileQueryRow = {
  id: string;
  username: string;
  display_name: string | null;
  preferred_language: string;
  onboarding_completed: boolean;
  primary_club_id: string | null;
  registration_year: number;
  level: number;
  xp: number;
  clubs: { name: string } | null;
  generations: { name: string } | null;
  titles: { name: string } | null;
  badges: { name: string } | null;
};

function mapProfileSummary(profile: ProfileQueryRow): ProfileSummary {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    preferredLanguage: profile.preferred_language,
    onboardingCompleted: profile.onboarding_completed,
    primaryClubId: profile.primary_club_id,
    primaryClubName: profile.clubs?.name ?? null,
    generationName: profile.generations?.name ?? null,
    level: profile.level,
    xp: profile.xp,
    titleName: profile.titles?.name ?? null,
    selectedBadgeName: profile.badges?.name ?? null,
    registrationYear: profile.registration_year,
  };
}
