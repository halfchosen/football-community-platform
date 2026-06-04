import { createClient } from "@/lib/supabase/server";
import {
  type OnboardingInput,
  type ProfileSettingsInput,
} from "@/domains/profile/schemas";
import { getInitialIdentityDefaults } from "@/server/services/identity-service";

export async function completeOnboarding(userId: string, input: OnboardingInput) {
  const supabase = await createClient();
  const { generationId, titleId } = await getInitialIdentityDefaults();

  const { error: profileError } = await supabase.from("user_profiles").upsert({
    id: userId,
    username: input.username,
    display_name: input.displayName,
    primary_club_id: input.primaryClubId,
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

  return replaceSecondaryClubs(userId, input.secondaryClubIds);
}

export async function updateEditableProfile(
  userId: string,
  input: ProfileSettingsInput,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({
      username: input.username,
      display_name: input.displayName,
      primary_club_id: input.primaryClubId,
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

  return replaceSecondaryClubs(userId, input.secondaryClubIds);
}

async function upsertPrivateSettings(userId: string, interfaceLanguage: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("user_private_settings").upsert({
    user_id: userId,
    interface_language: interfaceLanguage,
  });

  return error?.message ?? null;
}

async function replaceSecondaryClubs(userId: string, secondaryClubIds: string[]) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("user_supported_clubs")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return deleteError.message;
  }

  if (secondaryClubIds.length === 0) {
    return null;
  }

  const { error: insertError } = await supabase
    .from("user_supported_clubs")
    .insert(
      secondaryClubIds.map((clubId) => ({
        user_id: userId,
        club_id: clubId,
        support_type: "secondary",
      })),
    );

  return insertError?.message ?? null;
}
