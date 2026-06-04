import type { ClubOption } from "@/lib/db/queries/clubs";

type SupportedClubsSelectorProps = {
  clubs: ClubOption[];
  selectedClubIds?: string[];
};

export function SupportedClubsSelector({
  clubs,
  selectedClubIds = [],
}: SupportedClubsSelectorProps) {
  return (
    <fieldset className="grid gap-3">
      <div>
        <legend className="text-sm font-medium text-stone-900">
          Secondary supported clubs
        </legend>
        <p className="mt-1 text-xs text-stone-500">
          Optional for Sprint 1. Choose up to three.
        </p>
      </div>
      <div className="grid max-h-48 gap-2 overflow-auto rounded-md border border-stone-200 bg-white p-3">
        {clubs.map((club) => (
          <label
            className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-stone-50"
            key={club.id}
          >
            <span>
              <span className="font-medium text-stone-900">{club.name}</span>
              {club.leagueName ? (
                <span className="ml-2 text-xs text-stone-500">
                  {club.leagueName}
                </span>
              ) : null}
            </span>
            <input
              defaultChecked={selectedClubIds.includes(club.id)}
              name="secondaryClubIds"
              type="checkbox"
              value={club.id}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
