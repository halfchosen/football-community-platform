import type { ClubOption, LeagueOption } from "@/lib/db/queries/clubs";
import { LeagueClubSelector } from "@/components/onboarding/league-club-selector";

type PrimaryClubSelectorProps = {
  clubs: ClubOption[];
  leagues: LeagueOption[];
  defaultClubId?: string | null;
  defaultSuggestionName?: string | null;
};

export function PrimaryClubSelector(props: PrimaryClubSelectorProps) {
  return (
    <LeagueClubSelector
      {...props}
      label="Primary supported club"
      prefix="primary"
      required
    />
  );
}
