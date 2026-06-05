import { createClient } from "@/lib/supabase/server";
import {
  type ClubIdentityInput,
  type NationalTeamIdentityInput,
  type OnboardingInput,
  type ProfileSettingsInput,
} from "@/domains/profile/schemas";
import { getInitialIdentityDefaults } from "@/server/services/identity-service";

export async function completeOnboarding(userId: string, input: OnboardingInput) {
  const supabase = await createClient();
  const { generationId, titleId } = await getInitialIdentityDefaults();
  const primarySuggestionId = await createClubSuggestion(
    userId,
    "primary",
    input.primaryClub,
  );
  const nationalTeamSuggestionId = await createNationalTeamSuggestion(
    userId,
    input.nationalTeam,
  );

  const { error: profileError } = await supabase.from("user_profiles").upsert({
    id: userId,
    username: input.username,
    primary_club_id: input.primaryClub.clubId,
    primary_club_suggestion_id: primarySuggestionId,
    national_team_id: input.nationalTeam?.nationalTeamId ?? null,
    national_team_suggestion_id: nationalTeamSuggestionId,
    preferred_language: input.preferredLanguage,
    onboarding_completed: true,
    is_18_plus_confirmed: input.is18PlusConfirmed,
    community_rules_accepted_at: new Date().toISOString(),
    registration_year: new Date().getFullYear(),
    generation_id: generationId,
    level: 1,
    xp: 0,
    current_title_id: titleId,
    reputation_score: 0,
  });

  if (profileError) {
    return profileError.message;
  }

  const settingsError = await upsertPrivateSettings(userId, input.preferredLanguage);

  if (settingsError) {
    return settingsError;
  }

  return replaceSecondaryClubs(userId, input.secondaryClubs);
}

export async function updateEditableProfile(
  userId: string,
  input: ProfileSettingsInput,
) {
  const supabase = await createClient();
  const primarySuggestionId = await createClubSuggestion(
    userId,
    "primary",
    input.primaryClub,
  );
  const nationalTeamSuggestionId = await createNationalTeamSuggestion(
    userId,
    input.nationalTeam,
  );

  const { error } = await supabase
    .from("user_profiles")
    .update({
      username: input.username,
      display_name: input.displayName,
      primary_club_id: input.primaryClub.clubId,
      primary_club_suggestion_id: primarySuggestionId,
      national_team_id: input.nationalTeam?.nationalTeamId ?? null,
      national_team_suggestion_id: nationalTeamSuggestionId,
      preferred_language: input.preferredLanguage,
    })
    .eq("id", userId);

  if (error) {
    return error.message;
  }

  const settingsError = await upsertPrivateSettings(userId, input.preferredLanguage);

  if (settingsError) {
    return settingsError;
  }

  return replaceSecondaryClubs(userId, input.secondaryClubs);
}

async function upsertPrivateSettings(userId: string, interfaceLanguage: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("user_private_settings").upsert({
    user_id: userId,
    interface_language: interfaceLanguage,
  });

  return error?.message ?? null;
}

async function replaceSecondaryClubs(
  userId: string,
  secondaryClubs: ClubIdentityInput[],
) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("user_supported_clubs")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return deleteError.message;
  }

  if (secondaryClubs.length === 0) {
    return null;
  }

  const suggestionIds = await Promise.all(
    secondaryClubs.map((identity) =>
      createClubSuggestion(userId, "secondary", identity),
    ),
  );

  const { error: insertError } = await supabase
    .from("user_supported_clubs")
    .insert(
      secondaryClubs.map((identity, index) => ({
        user_id: userId,
        club_id: identity.clubId,
        club_suggestion_id: suggestionIds[index],
        support_type: "secondary",
      })),
    );

  return insertError?.message ?? null;
}

async function createClubSuggestion(
  userId: string,
  context: "primary" | "secondary",
  identity: ClubIdentityInput,
) {
  if (!identity.suggestionName) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_suggestions")
    .insert({
      user_id: userId,
      context,
      suggested_name: identity.suggestionName,
      league_id: identity.leagueId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

async function createNationalTeamSuggestion(
  userId: string,
  identity: NationalTeamIdentityInput | null,
) {
  if (!identity?.suggestionName) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_suggestions")
    .insert({
      user_id: userId,
      context: "national_team",
      suggested_name: identity.suggestionName,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}
