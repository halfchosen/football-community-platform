"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@/components/ui/icons";
import { FEED_NAV_CATEGORIES, type FeedScope } from "@/domains/forum/feed";

/** Each tab wears the colour of the topics behind it. */
const TAB_FAMILY: Record<string, string> = {
  transfer: "cat-gold",
  match: "cat-pitch",
  rumours: "cat-violet",
  questions: "cat-violet",
  news: "cat-blue",
  official: "cat-blue",
  tactical: "cat-cyan",
  history: "cat-brick",
};

export type FeedTeamFilter = {
  id: string;
  label: string;
  scope: Extract<FeedScope, "fan" | "club">;
  clubId?: string;
  clubName?: string;
};

export type FeedFilterState = {
  category: string;
  scope: FeedScope;
  clubId: string;
  clubName: string;
  search: string;
};

type FeedToolbarProps = FeedFilterState & {
  isLoggedIn: boolean;
  teamFilters: FeedTeamFilter[];
  newTopicHref?: string;
  previewMode?: boolean;
  onPreviewChange?: (state: FeedFilterState) => void;
};

/**
 * Two levels, visibly different weights:
 *  - Categories are the primary navigation → underlined tab strip.
 *  - Club filters are a secondary refinement → small quiet chips.
 * The compose action is the only filled control on the surface.
 */
export function FeedToolbar({
  category,
  scope,
  clubId,
  clubName,
  search,
  isLoggedIn,
  teamFilters,
  newTopicHref,
  previewMode = false,
  onPreviewChange,
}: FeedToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [local, setLocal] = useState<FeedFilterState>({
    category,
    scope,
    clubId,
    clubName,
    search,
  });
  const current = previewMode
    ? local
    : { category, scope, clubId, clubName, search };
  const searchWithoutTag = current.search.trim().startsWith("#")
    ? ""
    : current.search;

  function update(patch: Partial<FeedFilterState>) {
    const next = { ...current, ...patch };

    if (previewMode) {
      setLocal(next);
      onPreviewChange?.(next);
      return;
    }

    const params = new URLSearchParams();
    if (next.category !== "all") params.set("type", next.category);
    if (next.scope !== "all") params.set("scope", next.scope);
    if (next.scope === "club" && next.clubId) params.set("club", next.clubId);
    if (next.scope === "club" && next.clubName)
      params.set("team", next.clubName);
    if (next.search.trim()) params.set("q", next.search.trim());

    const query = params.toString();
    const target = query ? `/?${query}` : "/";
    if (pathname === "/") {
      router.replace(target, { scroll: false });
    } else {
      router.push(target);
    }
  }

  const topicHref = newTopicHref ?? (isLoggedIn ? "/forum/new" : "/login");

  return (
    <section className="mb-4 min-w-0 max-w-full">
      <div className="flex items-end gap-3 border-b border-line">
        <nav
          aria-label="Feed categories"
          className="-mb-px flex min-w-0 flex-1 gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FEED_NAV_CATEGORIES.map((entry) => {
            const active = current.category === entry.value;
            return (
              <button
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap border-b-2 px-2.5 pb-2.5 pt-1 text-[13.5px] font-semibold transition-colors ${
                  TAB_FAMILY[entry.value] ?? ""
                } ${
                  active
                    ? TAB_FAMILY[entry.value]
                      ? "tab-on"
                      : "border-accent text-accent-strong"
                    : "border-transparent text-ink-3 hover:text-ink"
                }`}
                key={entry.value}
                onClick={() =>
                  update({ category: entry.value, search: searchWithoutTag })
                }
                type="button"
              >
                {entry.navLabel ?? entry.label}
              </button>
            );
          })}
        </nav>

        <Link
          aria-label={
            isLoggedIn ? "Start a new topic" : "Log in to start a topic"
          }
          className="mb-2 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-accent-strong px-3 text-[13px] font-semibold text-white transition-colors hover:bg-pitch-deep focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-1"
          href={topicHref}
        >
          <PlusIcon size={15} />
          <span className="hidden sm:inline">New topic</span>
        </Link>
      </div>

      {teamFilters.length > 0 ? (
        <nav
          aria-label="Your clubs"
          className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <FilterChip
            active={current.scope === "all"}
            label="All football"
            onClick={() =>
              update({
                scope: "all",
                clubId: "",
                clubName: "",
                search: searchWithoutTag,
              })
            }
          />
          {teamFilters.map((team) => (
            <FilterChip
              active={
                team.scope === "fan"
                  ? current.scope === "fan"
                  : Boolean(
                      current.scope === "club" &&
                        ((team.clubId && current.clubId === team.clubId) ||
                          (!team.clubId && current.clubName === team.clubName)),
                    )
              }
              key={team.id}
              label={team.label}
              onClick={() =>
                update({
                  scope: team.scope,
                  clubId: team.clubId ?? "",
                  clubName: team.clubName ?? "",
                  search: searchWithoutTag,
                })
              }
            />
          ))}
        </nav>
      ) : null}
    </section>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`h-7 shrink-0 whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold transition-colors ${
        active
          ? "border-accent bg-accent text-white"
          : "border-line-strong bg-surface text-ink-3 hover:border-ink-4 hover:text-ink"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
