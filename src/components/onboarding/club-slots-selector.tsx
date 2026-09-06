"use client";

import { useMemo, useState } from "react";
import type { ClubOption } from "@/lib/db/queries/clubs";
import type { SecondaryClubIdentity } from "@/lib/db/queries/profiles";
import {
  Combobox,
  type ComboboxFooterAction,
  type ComboboxOption,
} from "@/components/ui/combobox";
import {
  AlertIcon,
  CheckIcon,
  LockIcon,
  StarIcon,
} from "@/components/ui/icons";
import { ClubAvatar } from "@/components/onboarding/club-avatar";
import {
  FAN_CLUB_LOCKED_MESSAGE,
  LIKED_CLUBS_COOLDOWN_MESSAGE,
} from "@/domains/profile/schemas";
import { suggestClub } from "@/server/actions/profile/suggest-club";

const NONE_VALUE = "__none__";
const MAX_LIKED = 3;

type ClubSlot = {
  /** "" (empty) | catalog club id | NONE_VALUE (explicit no FAN club). */
  value: string;
  leagueId: string;
};

type ActiveTarget =
  | { kind: "fan" }
  | { kind: "liked"; index: number }
  | { kind: "liked-new" }
  | null;

type SuggestState =
  | { open: false }
  | {
      open: true;
      context: "primary" | "secondary";
      name: string;
      status: "idle" | "sending" | "sent" | "error";
      error?: string;
    };

type ClubSlotsSelectorProps = {
  clubs: ClubOption[];
  defaultPrimaryClubId?: string | null;
  /** Catalog-fallback club stored as a suggestion name (matched back by name). */
  defaultPrimarySuggestionName?: string | null;
  /** Profile explicitly saved with no FAN club. */
  defaultNoFanClub?: boolean;
  defaultSecondaryClubs?: SecondaryClubIdentity[];
  /** FAN club is outside its 24h edit window — render read-only. */
  fanLocked?: boolean;
  /** Liked clubs are inside their 21-day cooldown — render read-only. */
  likedCooldownActive?: boolean;
  primaryError?: string;
  secondaryError?: string;
};

// Football identity picker. "My FAN club" is the single main identity;
// "Teams I like / follow" are optional extra clubs. Catalog-only: free text
// never becomes an identity — "My club is not listed" files a pending
// suggestion to the separate waitlist instead. One club per league across all
// slots; clubs from used leagues are shown disabled with the reason.
export function ClubSlotsSelector({
  clubs,
  defaultPrimaryClubId,
  defaultPrimarySuggestionName,
  defaultNoFanClub = false,
  defaultSecondaryClubs = [],
  fanLocked = false,
  likedCooldownActive = false,
  primaryError,
  secondaryError,
}: ClubSlotsSelectorProps) {
  const clubById = useMemo(() => {
    const map = new Map<string, ClubOption>();
    for (const club of clubs) {
      map.set(club.id, club);
    }
    return map;
  }, [clubs]);

  const clubByName = useMemo(() => {
    const map = new Map<string, ClubOption>();
    for (const club of clubs) {
      map.set(club.name.toLowerCase(), club);
    }
    return map;
  }, [clubs]);

  const [fan, setFan] = useState<ClubSlot>(() => {
    if (defaultNoFanClub) {
      return { value: NONE_VALUE, leagueId: "" };
    }
    if (defaultPrimaryClubId) {
      const club = clubById.get(defaultPrimaryClubId);
      return { value: defaultPrimaryClubId, leagueId: club?.leagueId ?? "" };
    }
    if (defaultPrimarySuggestionName) {
      const club = clubByName.get(defaultPrimarySuggestionName.toLowerCase());
      if (club) {
        return { value: club.id, leagueId: club.leagueId };
      }
    }
    return { value: "", leagueId: "" };
  });
  const [liked, setLiked] = useState<ClubSlot[]>(() =>
    defaultSecondaryClubs.slice(0, MAX_LIKED).flatMap((entry) => {
      if (entry.clubId) {
        const club = clubById.get(entry.clubId);
        return [{ value: entry.clubId, leagueId: club?.leagueId ?? "" }];
      }
      const club = clubByName.get(entry.displayName.toLowerCase());
      return club ? [{ value: club.id, leagueId: club.leagueId }] : [];
    }),
  );
  const [active, setActive] = useState<ActiveTarget>(null);
  const [suggest, setSuggest] = useState<SuggestState>({ open: false });

  const fanHasClub = fan.value !== "" && fan.value !== NONE_VALUE;

  // Clubs/leagues already used by slots other than the one being edited, so
  // re-picking a slot never locks against its own selection.
  const { takenClubIds, takenLeagueIds } = useMemo(() => {
    const editedIndex =
      active?.kind === "fan"
        ? 0
        : active?.kind === "liked"
          ? active.index + 1
          : -1;
    const clubIds = new Set<string>();
    const leagueIds = new Set<string>();

    [fan, ...liked].forEach((slot, index) => {
      if (index === editedIndex) {
        return;
      }
      if (slot.value && slot.value !== NONE_VALUE) {
        clubIds.add(slot.value);
      }
      if (slot.leagueId) {
        leagueIds.add(slot.leagueId);
      }
    });

    return { takenClubIds: clubIds, takenLeagueIds: leagueIds };
  }, [fan, liked, active]);

  const options = useMemo<ComboboxOption[]>(
    () =>
      clubs.map((club) => {
        const alreadyPicked = takenClubIds.has(club.id);
        const leagueUsed = !alreadyPicked && takenLeagueIds.has(club.leagueId);

        return {
          value: club.id,
          label: club.name,
          group: club.leagueName,
          sublabel: club.countryName ?? club.leagueName,
          disabled: alreadyPicked || leagueUsed,
          disabledHint: alreadyPicked
            ? "Picked"
            : leagueUsed
              ? "1 per league"
              : undefined,
        };
      }),
    [clubs, takenClubIds, takenLeagueIds],
  );

  function labelFor(slot: ClubSlot) {
    if (slot.value === NONE_VALUE) {
      return "No FAN club";
    }
    return clubById.get(slot.value)?.name ?? "Selected club";
  }

  function assign(slot: ClubSlot) {
    if (!active) {
      return;
    }
    if (active.kind === "fan") {
      setFan(slot);
    } else if (active.kind === "liked") {
      setLiked((prev) =>
        prev.map((item, i) => (i === active.index ? slot : item)),
      );
    } else {
      setLiked((prev) => (prev.length < MAX_LIKED ? [...prev, slot] : prev));
    }
    setActive(null);
  }

  function handleSelect(value: string) {
    const club = clubById.get(value);
    assign({ value, leagueId: club?.leagueId ?? "" });
  }

  function handleFooterAction(actionId: string) {
    if (actionId === "none") {
      assign({ value: NONE_VALUE, leagueId: "" });
      return;
    }

    if (actionId === "suggest") {
      const context = active?.kind === "fan" ? "primary" : "secondary";
      setActive(null);
      setSuggest({ open: true, context, name: "", status: "idle" });
    }
  }

  async function submitSuggestion() {
    if (!suggest.open || suggest.status === "sending") {
      return;
    }

    setSuggest({ ...suggest, status: "sending", error: undefined });
    const result = await suggestClub(suggest.name, suggest.context);

    if (result.ok) {
      setSuggest({ ...suggest, status: "sent", error: undefined });
    } else {
      setSuggest({ ...suggest, status: "error", error: result.error });
    }
  }

  const fanFooterActions: ComboboxFooterAction[] = [
    { id: "none", label: "I don't support any club", icon: "—" },
    { id: "suggest", label: "My club is not listed", icon: "+" },
  ];
  const likedFooterActions: ComboboxFooterAction[] = [
    { id: "suggest", label: "My club is not listed", icon: "+" },
  ];

  const floatingMenu = (
    searchPlaceholder: string,
    footerActions: ComboboxFooterAction[],
  ) => (
    <div className="absolute left-0 right-0 top-full z-40 mt-2">
      <Combobox
        asPanel
        footerActions={footerActions}
        getLeading={(option) => <ClubAvatar name={option.label} />}
        key={JSON.stringify(active)}
        onChange={handleSelect}
        onClose={() => setActive(null)}
        onFooterAction={handleFooterAction}
        options={options}
        placeholder="Search clubs"
        searchPlaceholder={searchPlaceholder}
        value=""
      />
    </div>
  );

  return (
    <section className="grid gap-4">
      <p className="flex items-start gap-2 rounded-md border border-warn-line bg-warn-wash px-3.5 py-3 text-[13px] leading-6 text-warn">
        <AlertIcon size={15} className="mt-0.5 shrink-0" />
        These choices decide which club topics you can start. Pick only the
        clubs you actually support or follow.
      </p>

      {/* FAN club (required unless explicitly none) */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-4">
          My FAN club
        </p>
        <div className="relative">
          {fan.value ? (
            <FilledSlot
              fan
              isNone={fan.value === NONE_VALUE}
              label={labelFor(fan)}
              locked={fanLocked}
              onChange={() => setActive({ kind: "fan" })}
              onRemove={() => {
                setFan({ value: "", leagueId: "" });
                setActive(null);
              }}
            />
          ) : (
            <button
              className={`group flex w-full items-center gap-3 rounded-lg border-2 border-dashed bg-surface p-4 text-left transition hover:border-accent hover:bg-sunken ${
                primaryError ? "border-danger" : "border-line-strong"
              }`}
              onClick={() =>
                setActive((prev) =>
                  prev?.kind === "fan" ? null : { kind: "fan" },
                )
              }
              type="button"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-navy text-white">
                <StarIcon size={17} filled />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-ink">
                    My FAN club
                  </span>
                  <span className="rounded-[3px] bg-accent-wash px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-accent-strong">
                    Main identity
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-ink-3">
                  The main club you identify with — tap to search
                </span>
              </span>
              <span className="text-ink-4 transition group-hover:text-navy">
                <PlusIcon />
              </span>
            </button>
          )}

          {active?.kind === "fan"
            ? floatingMenu("Search for your FAN club…", fanFooterActions)
            : null}
        </div>

        {primaryError ? <FieldError message={primaryError} /> : null}

        {fanLocked ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-6 text-ink-3">
            <LockIcon size={13} className="mt-0.5 shrink-0" />
            {FAN_CLUB_LOCKED_MESSAGE}
          </p>
        ) : (
          <p className="mt-2 text-xs leading-6 text-ink-3">
            Your FAN club is your main identity here, and it locks in when your
            place is confirmed. Corrections after that go through a review.
          </p>
        )}
      </div>

      {/* Teams I like / follow — appear once the FAN choice is made */}
      {fan.value ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-4">
            Teams I like / follow ·{" "}
            <span className="font-medium normal-case tracking-normal text-ink-4">
              optional
            </span>
          </p>
          <div className="relative">
            <div className="flex flex-wrap gap-3">
              {liked.map((slot, index) => (
                <FilledSlot
                  key={`${slot.value}-${index}`}
                  compact
                  label={labelFor(slot)}
                  locked={likedCooldownActive}
                  onChange={() => setActive({ kind: "liked", index })}
                  onRemove={() =>
                    setLiked((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              ))}

              {likedCooldownActive ? null : liked.length < MAX_LIKED ? (
                <button
                  className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-2.5 text-sm font-semibold text-ink-2 transition hover:border-accent hover:text-navy"
                  onClick={() =>
                    setActive((prev) =>
                      prev?.kind === "liked-new" ? null : { kind: "liked-new" },
                    )
                  }
                  type="button"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-line text-ink-2">
                    +
                  </span>
                  {liked.length === 0 ? "Add a team" : "Add another"}
                </button>
              ) : (
                <p className="self-center text-xs font-medium text-ink-4">
                  Maximum of {MAX_LIKED} reached.
                </p>
              )}
            </div>

            {active?.kind === "liked" || active?.kind === "liked-new"
              ? floatingMenu("Search teams to add…", likedFooterActions)
              : null}
          </div>

          {secondaryError ? <FieldError message={secondaryError} /> : null}

          {likedCooldownActive ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-3">
              <span aria-hidden>⏳</span>
              {LIKED_CLUBS_COOLDOWN_MESSAGE}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              Teams you like are clubs from other leagues you enjoy following —
              not your main fan identity. They can be changed more flexibly, but
              not repeatedly: after saving, changes may be limited by a cooldown
              period.
            </p>
          )}
        </div>
      ) : null}

      {/* "My club is not listed" suggestion flow (separate waitlist) */}
      {suggest.open ? (
        <div className="grid gap-3 rounded-lg border border-line-strong bg-sunken/70 p-4">
          {suggest.status === "sent" ? (
            <>
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-accent-strong">
                <CheckIcon size={15} />
                Thanks — your suggestion went in for review.
              </p>
              <p className="text-xs leading-relaxed text-ink-3">
                Pending suggestions don&apos;t appear in pickers and don&apos;t
                count as your FAN club or a team you like. Meanwhile, you can
                pick a catalog club
                {suggest.context === "primary"
                  ? " or continue without one"
                  : ""}
                .
              </p>
              <button
                className="h-9 w-fit rounded-md border border-line-strong bg-surface px-3.5 text-[13.5px] font-semibold text-ink transition-colors hover:bg-sunken"
                onClick={() => setSuggest({ open: false })}
                type="button"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="font-semibold text-ink">Suggest a club</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-3">
                  We&apos;ll review it and add it to the catalog. A pending
                  suggestion doesn&apos;t become your FAN club or a team you
                  like.
                </p>
              </div>
              <input
                aria-label="Club name to suggest"
                className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm outline-none transition placeholder:text-ink-4 focus:border-navy focus:ring-2 focus:ring-navy/10"
                maxLength={80}
                onChange={(event) =>
                  setSuggest({ ...suggest, name: event.target.value })
                }
                placeholder="Official club name, e.g. Göztepe SK"
                value={suggest.name}
              />
              {suggest.status === "error" && suggest.error ? (
                <FieldError message={suggest.error} />
              ) : null}
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-strong disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    suggest.name.trim().length < 2 ||
                    suggest.status === "sending"
                  }
                  onClick={submitSuggestion}
                  type="button"
                >
                  {suggest.status === "sending"
                    ? "Sending…"
                    : "Send suggestion"}
                </button>
                <button
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-2 transition hover:bg-sunken"
                  onClick={() => setSuggest({ open: false })}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Hidden fields — server contract (club + league per slot, no-club flag) */}
      <input
        name="primaryClubId"
        type="hidden"
        value={fanHasClub ? fan.value : ""}
      />
      <input name="primaryLeagueId" type="hidden" value={fan.leagueId} />
      <input
        name="primaryNoClub"
        type="hidden"
        value={fan.value === NONE_VALUE ? "on" : ""}
      />
      {[0, 1, 2].map((index) => {
        const slot = liked[index];
        return (
          <span key={index}>
            <input
              name={`secondary${index}ClubId`}
              type="hidden"
              value={slot?.value ?? ""}
            />
            <input
              name={`secondary${index}LeagueId`}
              type="hidden"
              value={slot?.leagueId ?? ""}
            />
          </span>
        );
      })}
    </section>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      className="mt-2 flex items-start gap-1.5 text-[12.5px] font-medium text-danger"
      role="alert"
    >
      <AlertIcon size={14} className="mt-px shrink-0" />
      {message}
    </p>
  );
}

function FilledSlot({
  label,
  fan = false,
  isNone = false,
  compact = false,
  locked = false,
  onChange,
  onRemove,
}: {
  label: string;
  fan?: boolean;
  isNone?: boolean;
  compact?: boolean;
  locked?: boolean;
  onChange: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-md border bg-surface p-2.5 ${
        fan ? "border-line-strong" : "border-line"
      } ${compact ? "" : "w-full"}`}
    >
      {isNone ? (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-line text-lg text-ink-3">
          —
        </span>
      ) : (
        <ClubAvatar name={label || "Club"} size={fan ? "md" : "sm"} />
      )}
      <button
        className="min-w-0 flex-1 text-left disabled:cursor-default"
        disabled={locked}
        onClick={onChange}
        title={locked ? undefined : "Change"}
        type="button"
      >
        {fan ? (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-navy">
            <StarIcon size={11} filled />
            FAN club
          </span>
        ) : null}
        <span className="block max-w-[14rem] truncate font-semibold text-ink">
          {label}
        </span>
        {isNone ? (
          <span className="block text-xs text-ink-3">
            You can pick a club anytime — club-specific topics stay off until
            you do.
          </span>
        ) : null}
      </button>
      {locked ? (
        <span aria-hidden className="px-1.5 text-ink-4" title="Locked">
          <LockIcon size={14} />
        </span>
      ) : (
        <button
          aria-label={`Remove ${label}`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-4 transition hover:bg-sunken hover:text-ink-2"
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
      )}
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
