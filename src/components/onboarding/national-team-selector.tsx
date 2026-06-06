"use client";

import { useMemo, useState } from "react";
import type { NationalTeamOption } from "@/lib/db/queries/clubs";
import { Combobox, OTHER_VALUE, type ComboboxOption } from "@/components/ui/combobox";
import { ClubAvatar } from "@/components/onboarding/club-avatar";

const NONE_VALUE = "__none__";

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
    defaultSuggestionName ? OTHER_VALUE : (defaultNationalTeamId ?? NONE_VALUE),
  );
  const [suggestion, setSuggestion] = useState(defaultSuggestionName ?? "");

  const options = useMemo<ComboboxOption[]>(
    () => [
      { value: NONE_VALUE, label: "I don't follow a national team" },
      ...nationalTeams.map((team) => ({
        value: team.id,
        label: team.name,
        sublabel: team.fifaCode ?? team.confederation,
      })),
    ],
    [nationalTeams],
  );

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-serif text-xl font-bold text-stone-950">
          National team
        </h2>
        <span className="rounded-full bg-stone-200/70 px-2.5 py-1 text-xs font-semibold text-stone-600">
          Optional
        </span>
      </div>
      <p className="-mt-1 text-sm text-stone-600">
        Part of your profile identity for future international features.
      </p>

      <Combobox
        allowOther
        getLeading={(option) =>
          option.value === NONE_VALUE || option.value === OTHER_VALUE ? null : (
            <ClubAvatar name={option.label} />
          )
        }
        onChange={setValue}
        onSelectOther={(query) => {
          if (query) {
            setSuggestion(query);
          }
        }}
        options={options}
        otherLabel="My national team isn't listed"
        otherTriggerLabel="Custom national team"
        placeholder="Choose a national team…"
        searchPlaceholder="Search national teams…"
        value={value}
      />

      <input name="nationalTeamId" type="hidden" value={value} />
      {value === OTHER_VALUE ? (
        <input
          aria-label="Write your national team"
          className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 hover:border-stone-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          name="nationalTeamSuggestion"
          onChange={(event) => setSuggestion(event.target.value)}
          placeholder="Write your national team's name"
          value={suggestion}
        />
      ) : null}
    </section>
  );
}
