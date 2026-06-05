import type { ClubOption, LeagueOption } from "@/lib/db/queries/clubs";
import type { SecondaryClubIdentity } from "@/lib/db/queries/profiles";
import { LeagueClubSelector } from "@/components/onboarding/league-club-selector";

type SecondaryClubsSelectorProps = {
  clubs: ClubOption[];
  leagues: LeagueOption[];
  selectedClubs?: SecondaryClubIdentity[];
};

export function SecondaryClubsSelector({
  clubs,
  leagues,
  selectedClubs = [],
}: SecondaryClubsSelectorProps) {
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-950">
          Secondary clubs
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Optional. Choose up to three clubs you also follow.
        </p>
      </div>
      <div className="grid gap-4">
        {[0, 1, 2].map((index) => {
          const selectedClub = selectedClubs[index];

          return (
            <LeagueClubSelector
              clubs={clubs}
              defaultClubId={selectedClub?.clubId}
              defaultSuggestionName={
                selectedClub?.clubSuggestionId ? selectedClub.displayName : null
              }
              key={index}
              label={`Secondary club ${index + 1}`}
              leagues={leagues}
              prefix={`secondary${index}`}
            />
          );
        })}
      </div>
    </section>
  );
}
