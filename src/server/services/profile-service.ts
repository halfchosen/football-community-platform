import { createClient } from "@/lib/supabase/server";
import {
  FAN_CLUB_EDIT_WINDOW_MS,
  FAN_CLUB_LOCKED_MESSAGE,
  hasClubIdentity,
  LIKED_CLUBS_COOLDOWN_MESSAGE,
  LIKED_CLUBS_COOLDOWN_MS,
  ONE_CLUB_PER_LEAGUE_MESSAGE,
  type ClubIdentityInput,
  type OnboardingInput,
  type ProfileSettingsInput,
} from "@/domains/profile/schemas";
import { getInitialIdentityDefaults } from "@/server/services/identity-service";

const SUGGESTIONS_UNAVAILABLE_MESSAGE =
  "Saving this club is temporarily unavailable. Please pick another club from the list for now.";
const USERNAME_TAKEN_MESSAGE = "That username is already taken — try another.";

export async function completeOnboarding(userId: string, input: OnboardingInput) {
  const supabase = await createClient();

  const leagueError = await validateLeagueUniquenessInDb([
    input.primaryClub,
    ...input.secondaryClubs,
  ]);

  if (leagueError) {
    return leagueError;
  }

  const { generationId, titleId } = await getInitialIdentityDefaults();

  let primarySuggestionId: string | null = null;

  if (input.primaryClub.suggestionName) {
    const suggestion = await createClubSuggestion(userId, "primary", input.primaryClub);

    if (suggestion.tableMissing) {
      return SUGGESTIONS_UNAVAILABLE_MESSAGE;
    }

    primarySuggestionId = suggestion.id;
  }

  const now = new Date().toISOString();
  const hasFanClub = hasClubIdentity(input.primaryClub);

  const { error: profileError } = await supabase.from("user_profiles").upsert({
    id: userId,
    username: input.username,
    primary_club_id: input.primaryClub.clubId,
    primary_club_suggestion_id: primarySuggestionId,
    preferred_language: input.preferredLanguage,
    onboarding_completed: true,
    is_18_plus_confirmed: input.is18PlusConfirmed,
    community_rules_accepted_at: now,
    registration_year: new Date().getFullYear(),
    generation_id: generationId,
    level: 1,
    xp: 0,
    current_title_id: titleId,
    reputation_score: 0,
    fan_club_selected_at: hasFanClub ? now : null,
    liked_clubs_updated_at: input.secondaryClubs.length > 0 ? now : null,
  });

  if (profileError) {
    return friendlyProfileError(profileError.message);
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

  const leagueError = await validateLeagueUniquenessInDb([
    input.primaryClub,
    ...input.secondaryClubs,
  ]);

  if (leagueError) {
    return leagueError;
  }

  const current = await getCurrentIdentityState(userId);

  if (!current) {
    return "Could not load your current profile.";
  }

  const now = Date.now();

  // FAN club: free edits within 24h of first selection, locked afterwards.
  const fanChanged = await hasFanClubChanged(current, input);

  if (fanChanged) {
    const selectedAt = current.fan_club_selected_at
      ? new Date(current.fan_club_selected_at).getTime()
      : null;

    if (selectedAt !== null && now - selectedAt > FAN_CLUB_EDIT_WINDOW_MS) {
      return FAN_CLUB_LOCKED_MESSAGE;
    }
  }

  // Liked clubs: changes start a 21-day cooldown.
  const likedChanged = await haveLikedClubsChanged(userId, input.secondaryClubs);

  if (likedChanged && current.liked_clubs_updated_at) {
    const updatedAt = new Date(current.liked_clubs_updated_at).getTime();

    if (now - updatedAt < LIKED_CLUBS_COOLDOWN_MS) {
      return LIKED_CLUBS_COOLDOWN_MESSAGE;
    }
  }

  let primarySuggestionId = current.primary_club_suggestion_id;

  if (fanChanged) {
    primarySuggestionId = null;

    if (input.primaryClub.suggestionName) {
      const suggestion = await createClubSuggestion(userId, "primary", input.primaryClub);

      if (suggestion.tableMissing) {
        return SUGGESTIONS_UNAVAILABLE_MESSAGE;
      }

      primarySuggestionId = suggestion.id;
    }
  }

  const hasFanClub = hasClubIdentity(input.primaryClub);
  const nowIso = new Date(now).toISOString();

  const { error } = await supabase
    .from("user_profiles")
    .update({
      username: input.username,
      display_name: input.displayName,
      primary_club_id: input.primaryClub.clubId,
      primary_club_suggestion_id: primarySuggestionId,
      preferred_language: input.preferredLanguage,
      fan_club_selected_at: hasFanClub
        ? (current.fan_club_selected_at ?? nowIso)
        : current.fan_club_selected_at,
      liked_clubs_updated_at: likedChanged
        ? nowIso
        : current.liked_clubs_updated_at,
    })
    .eq("id", userId);

  if (error) {
    return friendlyProfileError(error.message);
  }

  const settingsError = await upsertPrivateSettings(userId, input.preferredLanguage);

  if (settingsError) {
    return settingsError;
  }

  if (!likedChanged) {
    return null;
  }

  return replaceSecondaryClubs(userId, input.secondaryClubs);
}

type CurrentIdentityState = {
  primary_club_id: string | null;
  primary_club_suggestion_id: string | null;
  fan_club_selected_at: string | null;
  liked_clubs_updated_at: string | null;
};

async function getCurrentIdentityState(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      "primary_club_id, primary_club_suggestion_id, fan_club_selected_at, liked_clubs_updated_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as CurrentIdentityState;
}

async function hasFanClubChanged(
  current: CurrentIdentityState,
  input: ProfileSettingsInput,
) {
  if (input.primaryClub.clubId) {
    return input.primaryClub.clubId !== current.primary_club_id;
  }

  if (input.primaryClub.suggestionName) {
    if (!current.primary_club_suggestion_id) {
      return true;
    }

    const currentName = await getSuggestionName(current.primary_club_suggestion_id);

    return (
      (currentName ?? "").toLowerCase() !==
      input.primaryClub.suggestionName.toLowerCase()
    );
  }

  // Submitted no FAN club: changed if one is currently set.
  return Boolean(current.primary_club_id || current.primary_club_suggestion_id);
}

async function haveLikedClubsChanged(
  userId: string,
  submitted: ClubIdentityInput[],
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_supported_clubs")
    .select("club_id, club_suggestion_id")
    .eq("user_id", userId);

  if (error || !data) {
    // Fail open: treat as changed so the save still goes through.
    return true;
  }

  const rows = data as unknown as {
    club_id: string | null;
    club_suggestion_id: string | null;
  }[];

  const currentClubIds = rows
    .flatMap((row) => (row.club_id ? [row.club_id] : []))
    .sort();
  const submittedClubIds = submitted
    .flatMap((identity) => (identity.clubId ? [identity.clubId] : []))
    .sort();

  if (currentClubIds.join("|") !== submittedClubIds.join("|")) {
    return true;
  }

  const currentSuggestionIds = rows.flatMap((row) =>
    row.club_suggestion_id ? [row.club_suggestion_id] : [],
  );
  const currentNames = (
    await Promise.all(currentSuggestionIds.map((id) => getSuggestionName(id)))
  )
    .map((name) => (name ?? "").toLowerCase())
    .sort();
  const submittedNames = submitted
    .flatMap((identity) =>
      identity.suggestionName ? [identity.suggestionName.toLowerCase()] : [],
    )
    .sort();

  return currentNames.join("|") !== submittedNames.join("|");
}

async function getSuggestionName(suggestionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("club_suggestions")
    .select("suggested_name")
    .eq("id", suggestionId)
    .maybeSingle();

  const suggestion = data as unknown as { suggested_name: string } | null;

  return suggestion?.suggested_name ?? null;
}

/**
 * Authoritative one-club-per-league check for database clubs. The submitted
 * league ids already passed the schema-level check; this re-derives each
 * club's current league from club_league_memberships so a tampered payload
 * cannot bypass the rule. Fails open when the catalog tables are unavailable
 * (local fallback catalog clubs are validated via their league key instead).
 */
async function validateLeagueUniquenessInDb(identities: ClubIdentityInput[]) {
  const clubIds = identities.flatMap((identity) =>
    identity.clubId ? [identity.clubId] : [],
  );

  if (clubIds.length < 2) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_league_memberships")
    .select("club_id, league_id")
    .in("club_id", clubIds)
    .eq("is_current", true);

  if (error || !data) {
    return null;
  }

  const clubByLeague = new Map<string, string>();

  for (const row of data as unknown as { club_id: string; league_id: string }[]) {
    const existing = clubByLeague.get(row.league_id);

    if (existing && existing !== row.club_id) {
      return ONE_CLUB_PER_LEAGUE_MESSAGE;
    }

    clubByLeague.set(row.league_id, row.club_id);
  }

  return null;
}

function friendlyProfileError(message: string) {
  if (message.includes("user_profiles_username_key")) {
    return USERNAME_TAKEN_MESSAGE;
  }

  return message;
}

function isSuggestionsTableMissing(message: string) {
  return (
    message.includes("club_suggestions") &&
    (message.includes("schema cache") || message.includes("does not exist"))
  );
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

  const rows: {
    user_id: string;
    club_id: string | null;
    club_suggestion_id: string | null;
    support_type: "secondary";
  }[] = [];

  for (const identity of secondaryClubs) {
    if (identity.suggestionName) {
      const suggestion = await createClubSuggestion(userId, "secondary", identity);

      // Catalog-fallback clubs are stored via the suggestions table; when it
      // is missing we skip the entry rather than failing the whole save.
      if (suggestion.tableMissing || !suggestion.id) {
        continue;
      }

      rows.push({
        user_id: userId,
        club_id: null,
        club_suggestion_id: suggestion.id,
        support_type: "secondary",
      });
    } else if (identity.clubId) {
      rows.push({
        user_id: userId,
        club_id: identity.clubId,
        club_suggestion_id: null,
        support_type: "secondary",
      });
    }
  }

  if (rows.length === 0) {
    return null;
  }

  const { error: insertError } = await supabase
    .from("user_supported_clubs")
    .insert(rows);

  return insertError?.message ?? null;
}

async function createClubSuggestion(
  userId: string,
  context: "primary" | "secondary",
  identity: ClubIdentityInput,
): Promise<{ id: string | null; tableMissing: boolean }> {
  if (!identity.suggestionName) {
    return { id: null, tableMissing: false };
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
    if (isSuggestionsTableMissing(error.message)) {
      return { id: null, tableMissing: true };
    }

    throw new Error(error.message);
  }

  return { id: data.id, tableMissing: false };
}
