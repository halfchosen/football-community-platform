"use client";

import { useState } from "react";
import type { NationalTeamOption } from "@/lib/db/queries/clubs";
import { Input, Select } from "@/components/ui/field";

const NONE_VALUE = "__none__";
const OTHER_VALUE = "__other__";

type NationalTeamSelectorProps = {
  nationalTeams: NationalTeamOption[];
  defaultNationalTeamId?: string | null;
  defaultSuggestionName?: string | null;
};

export function NationalTeamSelector({
  nationalTeams,
  defaultNationalTeamId,
  defaultSuggestionName,
}: NationalTeamSelectorProps) {
  const [value, setValue] = useState(
    defaultSuggestionName ? OTHER_VALUE : defaultNationalTeamId ?? NONE_VALUE,
  );
  const [suggestion, setSuggestion] = useState(defaultSuggestionName ?? "");

  return (
    <section className="grid gap-4 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-950">
          National team
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Optional. This is only profile identity for future international features.
        </p>
      </div>
      <Select
        label="National team"
        name="nationalTeamId"
        onChange={(event) => setValue(event.target.value)}
        value={value}
      >
        <option value={NONE_VALUE}>I do not follow national teams</option>
        {nationalTeams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
            {team.fifaCode ? ` - ${team.fifaCode}` : ""}
          </option>
        ))}
        <option value={OTHER_VALUE}>Other / Not listed</option>
      </Select>
      {value === OTHER_VALUE ? (
        <Input
          label="Write your national team"
          name="nationalTeamSuggestion"
          onChange={(event) => setSuggestion(event.target.value)}
          required
          value={suggestion}
        />
      ) : null}
    </section>
  );
}
