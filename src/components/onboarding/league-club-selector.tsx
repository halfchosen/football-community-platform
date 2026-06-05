"use client";

import { useMemo, useState } from "react";
import type { ClubOption, LeagueOption } from "@/lib/db/queries/clubs";
import { Input, Select } from "@/components/ui/field";

const OTHER_VALUE = "__other__";

type LeagueClubSelectorProps = {
  clubs: ClubOption[];
  leagues: LeagueOption[];
  label: string;
  prefix: string;
  required?: boolean;
  defaultClubId?: string | null;
  defaultSuggestionName?: string | null;
};

export function LeagueClubSelector({
  clubs,
  leagues,
  label,
  prefix,
  required = false,
  defaultClubId,
  defaultSuggestionName,
}: LeagueClubSelectorProps) {
  const defaultClub = clubs.find((club) => club.id === defaultClubId);
  const [leagueId, setLeagueId] = useState(defaultClub?.leagueId ?? "");
  const [clubId, setClubId] = useState(
    defaultSuggestionName ? OTHER_VALUE : defaultClubId ?? "",
  );
  const [search, setSearch] = useState("");
  const [suggestion, setSuggestion] = useState(defaultSuggestionName ?? "");

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesLeague = leagueId ? club.leagueId === leagueId : true;
      const matchesSearch = club.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      return matchesLeague && matchesSearch;
    });
  }, [clubs, leagueId, search]);

  return (
    <section className="grid gap-4 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h3 className="text-base font-semibold text-stone-950">{label}</h3>
        <p className="mt-1 text-xs text-stone-500">
          Select a league first, then choose a club.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="League"
          name={`${prefix}LeagueId`}
          onChange={(event) => {
            const nextLeagueId = event.target.value;
            setLeagueId(nextLeagueId);

            if (
              nextLeagueId &&
              clubId !== OTHER_VALUE &&
              clubId &&
              !clubs.some(
                (club) => club.id === clubId && club.leagueId === nextLeagueId,
              )
            ) {
              setClubId("");
            }
          }}
          value={leagueId}
        >
          <option value="">All leagues</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
              {league.countryName ? ` - ${league.countryName}` : ""}
            </option>
          ))}
        </Select>
        <Input
          label="Search clubs"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Type a club name"
          type="search"
          value={search}
        />
      </div>
      <Select
        label="Club"
        name={`${prefix}ClubId`}
        onChange={(event) => setClubId(event.target.value)}
        required={required}
        value={clubId}
      >
        <option value="">{required ? "Choose a club" : "No club selected"}</option>
        {filteredClubs.map((club) => (
          <option key={`${club.leagueId}-${club.id}`} value={club.id}>
            {club.name} - {club.leagueName}
          </option>
        ))}
        <option value={OTHER_VALUE}>Other / My club is not listed</option>
      </Select>
      {clubId === OTHER_VALUE ? (
        <Input
          label="Write your club name"
          name={`${prefix}ClubSuggestion`}
          onChange={(event) => setSuggestion(event.target.value)}
          required={required || clubId === OTHER_VALUE}
          value={suggestion}
        />
      ) : null}
    </section>
  );
}
