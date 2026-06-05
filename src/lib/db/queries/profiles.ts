import { createClient } from "@/lib/supabase/server";

export type ProfileSummary = {
  id: string;
  username: string;
  displayName: string | null;
  preferredLanguage: string;
  onboardingCompleted: boolean;
  primaryClubId: string | null;
  primaryClubSuggestionId: string | null;
  primaryClubName: string | null;
  nationalTeamId: string | null;
  nationalTeamSuggestionId: string | null;
  nationalTeamName: string | null;
  generationName: string | null;
  level: number;
  xp: number;
  titleName: string | null;
  selectedBadgeName: string | null;
  registrationYear: number;
};

export type SecondaryClubIdentity = {
  clubId: string | null;
  clubSuggestionId: string | null;
  displayName: string;
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

  return data as unknown as {
    id: string;
    username: string;
    onboarding_completed: boolean;
  } | null;
}

export async function getOwnProfileSummary(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const profile = data as unknown as OwnProfileRow;

  const [
    primaryClubName,
    primarySuggestionName,
    nationalTeamName,
    nationalSuggestionName,
    generationName,
    titleName,
    selectedBadgeName,
  ] = await Promise.all([
    getClubName(profile.primary_club_id),
    getSuggestionName(profile.primary_club_suggestion_id),
    getNationalTeamName(profile.national_team_id),
    getSuggestionName(profile.national_team_suggestion_id),
    getGenerationName(profile.generation_id),
    getTitleName(profile.current_title_id),
    getBadgeName(profile.selected_badge_id),
  ]);

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    preferredLanguage: profile.preferred_language,
    onboardingCompleted: profile.onboarding_completed,
    primaryClubId: profile.primary_club_id,
    primaryClubSuggestionId: profile.primary_club_suggestion_id,
    primaryClubName: primaryClubName ?? primarySuggestionName,
    nationalTeamId: profile.national_team_id,
    nationalTeamSuggestionId: profile.national_team_suggestion_id,
    nationalTeamName: nationalTeamName ?? nationalSuggestionName,
    generationName,
    level: profile.level,
    xp: profile.xp,
    titleName,
    selectedBadgeName,
    registrationYear: profile.registration_year,
  };
}

export async function getPublicProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const publicProfile = data as unknown as PublicProfileRow;

  return {
    id: publicProfile.id,
    username: publicProfile.username,
    displayName: publicProfile.display_name,
    preferredLanguage: "en",
    onboardingCompleted: true,
    primaryClubId: null,
    primaryClubSuggestionId: null,
    primaryClubName: publicProfile.primary_club_name,
    nationalTeamId: null,
    nationalTeamSuggestionId: null,
    nationalTeamName: publicProfile.national_team_name,
    generationName: publicProfile.generation_name,
    level: publicProfile.level,
    xp: 0,
    titleName: publicProfile.title_name,
    selectedBadgeName: publicProfile.selected_badge_name,
    registrationYear: publicProfile.registration_year,
  };
}

export async function getSecondaryClubIdentities(
  userId: string,
): Promise<SecondaryClubIdentity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_supported_clubs")
    .select("club_id, club_suggestion_id")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as SecondaryClubRow[];

  const identities = await Promise.all(
    rows.map(async (row) => {
      const displayName =
        (await getClubName(row.club_id)) ??
        (await getSuggestionName(row.club_suggestion_id)) ??
        "Selected club";

      return {
        clubId: row.club_id,
        clubSuggestionId: row.club_suggestion_id,
        displayName,
      };
    }),
  );

  return identities;
}

async function getClubName(clubId: string | null) {
  if (!clubId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("clubs")
    .select("name")
    .eq("id", clubId)
    .maybeSingle();

  const club = data as unknown as { name: string } | null;

  return club?.name ?? null;
}

async function getSuggestionName(suggestionId: string | null) {
  if (!suggestionId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("club_suggestions")
    .select("suggested_name")
    .eq("id", suggestionId)
    .maybeSingle();

  const suggestion = data as unknown as { suggested_name: string } | null;

  return suggestion?.suggested_name ?? null;
}

async function getNationalTeamName(nationalTeamId: string | null) {
  if (!nationalTeamId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("national_teams")
    .select("name")
    .eq("id", nationalTeamId)
    .maybeSingle();

  const nationalTeam = data as unknown as { name: string } | null;

  return nationalTeam?.name ?? null;
}

async function getGenerationName(generationId: string | null) {
  if (!generationId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("generations")
    .select("name")
    .eq("id", generationId)
    .maybeSingle();

  const generation = data as unknown as { name: string } | null;

  return generation?.name ?? null;
}

async function getTitleName(titleId: string | null) {
  if (!titleId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("titles")
    .select("name")
    .eq("id", titleId)
    .maybeSingle();

  const title = data as unknown as { name: string } | null;

  return title?.name ?? null;
}

async function getBadgeName(badgeId: string | null) {
  if (!badgeId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("badges")
    .select("name")
    .eq("id", badgeId)
    .maybeSingle();

  const badge = data as unknown as { name: string } | null;

  return badge?.name ?? null;
}

type OwnProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  primary_club_id: string | null;
  primary_club_suggestion_id: string | null;
  national_team_id: string | null;
  national_team_suggestion_id: string | null;
  preferred_language: string;
  onboarding_completed: boolean;
  registration_year: number;
  generation_id: string | null;
  level: number;
  xp: number;
  current_title_id: string | null;
  selected_badge_id: string | null;
};

type PublicProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  primary_club_name: string | null;
  national_team_name: string | null;
  generation_name: string | null;
  level: number;
  title_name: string | null;
  selected_badge_name: string | null;
  registration_year: number;
};

type SecondaryClubRow = {
  club_id: string | null;
  club_suggestion_id: string | null;
};
