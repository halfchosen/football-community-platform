"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FEED_NAV_CATEGORIES,
  type FeedScope,
} from "@/domains/forum/feed";

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
  /** Preview hub: update the selected UI locally instead of navigating. */
  previewMode?: boolean;
  /** Lets the local preview apply the same filter state to its mock topics. */
  onPreviewChange?: (state: FeedFilterState) => void;
};

// Product-first feed controls: identity tags, compact category tabs, and the
// primary creation action. Global search lives in the site header.
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
    if (next.scope === "club" && next.clubName) params.set("team", next.clubName);
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
    <section className="mb-3 min-w-0 max-w-full overflow-hidden border-b border-violet-900/10 pb-3">
      <nav
        aria-label="Your clubs"
        className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <FilterChip
          active={current.scope === "all"}
          label="All clubs"
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

      <div className="mt-2 flex items-center gap-2">
        <nav
          aria-label="Feed categories"
          className="-mx-1 flex min-w-0 flex-1 gap-0.5 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FEED_NAV_CATEGORIES.map((entry) => {
            const active = current.category === entry.value;

            return (
              <button
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-lg px-1.5 py-2 text-[13px] font-bold transition ${
                  active
                    ? "bg-violet-100 text-violet-800"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
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

        <div className="shrink-0">
          <Link
            aria-label={isLoggedIn ? "Start a new topic" : "Log in to start a topic"}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-violet-700 px-3.5 text-sm font-bold text-white shadow-sm shadow-violet-700/20 transition hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            href={topicHref}
          >
            <span aria-hidden className="text-base leading-none">+</span>
            <span>New</span>
          </Link>
        </div>
      </div>
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
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
