"use client";

import { useMemo, useState } from "react";
import type { ClubOption } from "@/lib/db/queries/clubs";
import type { SecondaryClubIdentity } from "@/lib/db/queries/profiles";
import {
  Combobox,
  OTHER_VALUE,
  type ComboboxOption,
} from "@/components/ui/combobox";
import { ClubAvatar } from "@/components/onboarding/club-avatar";

type ClubSlot = {
  value: string; // "" | clubId | localClubId | OTHER_VALUE
  suggestion: string;
};

type ActiveTarget =
  | { kind: "favorite" }
  | { kind: "secondary"; index: number }
  | { kind: "secondary-new" }
  | null;

type ClubSlotsSelectorProps = {
  clubs: ClubOption[];
  defaultPrimaryClubId?: string | null;
  defaultPrimarySuggestionName?: string | null;
  defaultSecondaryClubs?: SecondaryClubIdentity[];
};

const MAX_SECONDARY = 3;
const EMPTY_SLOT: ClubSlot = { value: "", suggestion: "" };

// Unified club picker: one floating search menu fills a prominent (required)
// favorite slot. The optional secondary slots only appear after a favorite is
// chosen. Hidden inputs keep the exact primaryClub* / secondary0..2* contract.
export function ClubSlotsSelector({
  clubs,
  defaultPrimaryClubId,
  defaultPrimarySuggestionName,
  defaultSecondaryClubs = [],
}: ClubSlotsSelectorProps) {
  const clubNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const club of clubs) {
      map.set(club.id, club.name);
    }
    return map;
  }, [clubs]);

  const [favorite, setFavorite] = useState<ClubSlot>(() =>
    defaultPrimarySuggestionName
      ? { value: OTHER_VALUE, suggestion: defaultPrimarySuggestionName }
      : { value: defaultPrimaryClubId ?? "", suggestion: "" },
  );
  const [secondaries, setSecondaries] = useState<ClubSlot[]>(() =>
    defaultSecondaryClubs.slice(0, MAX_SECONDARY).map((club) =>
      club.clubId
        ? { value: club.clubId, suggestion: "" }
        : { value: OTHER_VALUE, suggestion: club.displayName },
    ),
  );
  const [active, setActive] = useState<ActiveTarget>(null);

  const chosenIds = [favorite, ...secondaries]
    .filter((slot) => slot.value && slot.value !== OTHER_VALUE)
    .map((slot) => slot.value);
  const chosenKey = chosenIds.join("|");

  const options = useMemo<ComboboxOption[]>(() => {
    const taken = new Set(chosenKey ? chosenKey.split("|") : []);
    return clubs
      .filter((club) => !taken.has(club.id))
      .map((club) => ({
        value: club.id,
        label: club.name,
        group: club.leagueName,
        sublabel: club.countryName ?? club.leagueName,
      }));
  }, [clubs, chosenKey]);

  function labelFor(slot: ClubSlot) {
    if (slot.value === OTHER_VALUE) {
      return slot.suggestion || "Custom club";
    }
    return clubNameById.get(slot.value) ?? "Selected club";
  }

  function assign(slot: ClubSlot) {
    if (!active) {
      return;
    }
    if (active.kind === "favorite") {
      setFavorite(slot);
    } else if (active.kind === "secondary") {
      setSecondaries((prev) =>
        prev.map((item, i) => (i === active.index ? slot : item)),
      );
    } else {
      setSecondaries((prev) =>
        prev.length < MAX_SECONDARY ? [...prev, slot] : prev,
      );
    }
    setActive(null);
  }

  function handleSelect(value: string) {
    if (value === OTHER_VALUE) {
      return; // handled by onSelectOther so we keep the typed name
    }
    assign({ value, suggestion: "" });
  }

  function handleSelectOther(query: string) {
    assign({ value: OTHER_VALUE, suggestion: query });
  }

  function updateSuggestion(target: ActiveTarget, suggestion: string) {
    if (!target) {
      return;
    }
    if (target.kind === "favorite") {
      setFavorite((prev) => ({ ...prev, suggestion }));
    } else if (target.kind === "secondary") {
      setSecondaries((prev) =>
        prev.map((item, i) =>
          i === target.index ? { ...item, suggestion } : item,
        ),
      );
    }
  }

  const canAddSecondary = secondaries.length < MAX_SECONDARY;

  const floatingMenu = (searchPlaceholder: string) => (
    <div className="absolute left-0 right-0 top-full z-40 mt-2">
      <Combobox
        allowOther
        asPanel
        getLeading={(option) =>
          option.value === OTHER_VALUE ? null : <ClubAvatar name={option.label} />
        }
        key={JSON.stringify(active)}
        onChange={handleSelect}
        onClose={() => setActive(null)}
        onSelectOther={handleSelectOther}
        options={options}
        otherLabel="My club isn't listed"
        otherTriggerLabel="Custom club"
        placeholder="Search clubs"
        searchPlaceholder={searchPlaceholder}
        value=""
      />
    </div>
  );

  return (
    <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-stone-950">Your clubs</h2>
        <p className="mt-1 text-sm text-stone-600">
          Start with the favorite club at the heart of your identity. You can add
          more clubs you follow once it&apos;s set.
        </p>
      </div>

      {/* Favorite (required) slot + its floating menu */}
      <div className="relative">
        {favorite.value ? (
          <FilledSlot
            favorite
            label={labelFor(favorite)}
            onChange={() => setActive({ kind: "favorite" })}
            onRemove={() => {
              setFavorite(EMPTY_SLOT);
              setActive(null);
            }}
            showCustomInput={favorite.value === OTHER_VALUE}
            suggestion={favorite.suggestion}
            onSuggestionChange={(value) =>
              updateSuggestion({ kind: "favorite" }, value)
            }
          />
        ) : (
          <button
            className="group flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-white p-4 text-left transition hover:border-emerald-600 hover:bg-stone-50"
            onClick={() =>
              setActive((prev) => (prev?.kind === "favorite" ? null : { kind: "favorite" }))
            }
            type="button"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-700 text-lg text-white">
              ★
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="font-semibold text-stone-900">Favorite club</span>
                <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Required
                </span>
              </span>
              <span className="mt-0.5 block text-sm text-stone-500">
                Tap to search and choose your main club
              </span>
            </span>
            <span className="text-stone-400 transition group-hover:text-emerald-700">
              <PlusIcon />
            </span>
          </button>
        )}

        {active?.kind === "favorite"
          ? floatingMenu("Search for your favorite club…")
          : null}
      </div>

      {/* Secondary slots appear only after a favorite is chosen */}
      {favorite.value ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            Other clubs you follow ·{" "}
            <span className="font-medium normal-case tracking-normal text-stone-400">
              optional
            </span>
          </p>
          <div className="relative">
            <div className="flex flex-wrap gap-3">
              {secondaries.map((slot, index) => (
                <FilledSlot
                  key={`${slot.value}-${index}`}
                  compact
                  label={labelFor(slot)}
                  onChange={() => setActive({ kind: "secondary", index })}
                  onRemove={() =>
                    setSecondaries((prev) => prev.filter((_, i) => i !== index))
                  }
                  showCustomInput={slot.value === OTHER_VALUE}
                  suggestion={slot.suggestion}
                  onSuggestionChange={(value) =>
                    updateSuggestion({ kind: "secondary", index }, value)
                  }
                />
              ))}

              {canAddSecondary ? (
                <button
                  className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-600 hover:text-emerald-800"
                  onClick={() =>
                    setActive((prev) =>
                      prev?.kind === "secondary-new"
                        ? null
                        : { kind: "secondary-new" },
                    )
                  }
                  type="button"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-stone-200 text-stone-600">
                    +
                  </span>
                  {secondaries.length === 0 ? "Add a club" : "Add another"}
                </button>
              ) : (
                <p className="self-center text-xs font-medium text-stone-400">
                  Maximum of {MAX_SECONDARY} reached.
                </p>
              )}
            </div>

            {active?.kind === "secondary" || active?.kind === "secondary-new"
              ? floatingMenu("Search clubs to add…")
              : null}
          </div>
        </div>
      ) : null}

      {/* Hidden fields — exact server contract */}
      <input name="primaryClubId" type="hidden" value={favorite.value} />
      <input
        name="primaryClubSuggestion"
        type="hidden"
        value={favorite.suggestion}
      />
      {[0, 1, 2].map((index) => {
        const slot = secondaries[index];
        return (
          <span key={index}>
            <input
              name={`secondary${index}ClubId`}
              type="hidden"
              value={slot?.value ?? ""}
            />
            <input
              name={`secondary${index}ClubSuggestion`}
              type="hidden"
              value={slot?.suggestion ?? ""}
            />
          </span>
        );
      })}
    </section>
  );
}

function FilledSlot({
  label,
  favorite = false,
  compact = false,
  showCustomInput,
  suggestion,
  onChange,
  onRemove,
  onSuggestionChange,
}: {
  label: string;
  favorite?: boolean;
  compact?: boolean;
  showCustomInput: boolean;
  suggestion: string;
  onChange: () => void;
  onRemove: () => void;
  onSuggestionChange: (value: string) => void;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border bg-white p-2.5 shadow-sm ${
        favorite ? "border-stone-300" : "border-stone-200"
      } ${compact ? "" : "w-full"}`}
    >
      <div className="flex items-center gap-2.5">
        <ClubAvatar name={label || "Club"} size={favorite ? "md" : "sm"} />
        <button
          className="min-w-0 flex-1 text-left"
          onClick={onChange}
          title="Change club"
          type="button"
        >
          {favorite ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              ★ Favorite
            </span>
          ) : null}
          <span className="block max-w-[12rem] truncate font-semibold text-stone-900">
            {label}
          </span>
        </button>
        <button
          aria-label={`Remove ${label}`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          onClick={onRemove}
          type="button"
        >
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {showCustomInput ? (
        <input
          aria-label="Write your club name"
          className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-300/60"
          onChange={(event) => onSuggestionChange(event.target.value)}
          placeholder="Write your club's name"
          value={suggestion}
        />
      ) : null}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
