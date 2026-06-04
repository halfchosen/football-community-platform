import type { ClubOption } from "@/lib/db/queries/clubs";
import { Select } from "@/components/ui/field";

type ClubSelectorProps = {
  clubs: ClubOption[];
  defaultValue?: string | null;
};

export function ClubSelector({ clubs, defaultValue }: ClubSelectorProps) {
  return (
    <Select
      defaultValue={defaultValue ?? ""}
      hint="Your primary club is part of your visible football identity."
      label="Primary supported club"
      name="primaryClubId"
      required
    >
      <option value="">Choose a club</option>
      {clubs.map((club) => (
        <option key={club.id} value={club.id}>
          {club.name} {club.leagueName ? `- ${club.leagueName}` : ""}
        </option>
      ))}
    </Select>
  );
}
