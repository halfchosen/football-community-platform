"use client";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "./brand";
import { Popover } from "@/components/ui/popover";
import { ButtonLink } from "@/components/ui/button";
import { ClubAvatar } from "@/components/onboarding/club-avatar";
import { BellIcon, ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { logout } from "@/server/actions/auth/logout";

export type HeaderViewer = {
  name: string;
  profileHref: string;
  staff?: boolean;
};

const ACCOUNT_GROUPS: [string, [string, string][]][] = [
  [
    "Community",
    [
      ["/me/activity", "My activity"],
      ["/me/saved", "Saved topics"],
      ["/me/notifications", "Notifications"],
      ["/me/reports", "My reports"],
    ],
  ],
  [
    "Settings",
    [
      ["/settings/profile", "Football identity"],
      ["/settings/account", "Account & privacy"],
    ],
  ],
];

export function CommunityHeader({
  viewer,
  searchAction = "/",
  searchValue = "",
  preview = false,
}: {
  viewer?: HeaderViewer | null;
  searchAction?: string;
  searchValue?: string;
  preview?: boolean;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <header className="site-header-solid sticky top-0 z-40 border-b border-line">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2.5 focus:z-50 focus:rounded-md focus:bg-navy focus:px-3.5 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <div className="site-width grid h-[var(--header-h)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-6">
        <Brand compact />

        <form
          role="search"
          aria-label="Search discussions"
          action={searchAction}
          method="get"
          className="relative mx-auto w-full max-w-[520px]"
        >
          <button
            type="submit"
            aria-label="Search"
            className="absolute inset-y-0 left-0 grid w-9 place-items-center rounded-md text-ink-4"
          >
            <SearchIcon size={16} />
          </button>
          <input
            name="q"
            type="search"
            key={searchValue}
            defaultValue={searchValue}
            aria-label="Search discussions or clubs"
            placeholder="Search takes, clubs, #tags"
            className="h-9 w-full rounded-md border border-line bg-sunken pl-9 pr-3 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-line-strong focus:border-navy focus:bg-surface focus:ring-2 focus:ring-navy/12"
          />
        </form>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-1 sm:gap-1.5"
        >
          {viewer ? (
            <>
              <Link
                href="/me/notifications"
                aria-label="Notifications"
                className="hidden h-9 w-9 place-items-center rounded-md text-ink-3 transition-colors hover:bg-sunken hover:text-ink sm:grid"
              >
                <BellIcon size={18} />
              </Link>
              <Popover
                open={menu}
                onOpenChange={setMenu}
                label="Your account"
                className="flex h-9 items-center gap-1.5 rounded-md pl-1 pr-1.5 text-[13.5px] font-semibold text-ink transition-colors hover:bg-sunken"
                trigger={
                  <>
                    <ClubAvatar name={viewer.name} />
                    <span className="hidden max-w-28 truncate xl:inline">
                      {viewer.name}
                    </span>
                    <ChevronDownIcon size={14} className="text-ink-4" />
                  </>
                }
              >
                <nav aria-label="Account navigation" className="grid gap-3">
                  {(
                    [
                      [
                        "Profile",
                        [[viewer.profileHref, "View public profile"]],
                      ],
                      ...ACCOUNT_GROUPS,
                      ...(viewer.staff
                        ? [
                            [
                              "Staff",
                              [
                                ["/admin/reports", "Review reports"],
                                ["/admin/members", "Members & admission"],
                              ],
                            ] as [string, [string, string][]],
                          ]
                        : []),
                    ] as [string, [string, string][]][]
                  ).map(([group, items]) => (
                    <div key={group}>
                      <p className="mb-1 px-2.5 t-eyebrow">{group}</p>
                      <div className="grid">
                        {items.map(([href, label]) => (
                          <Link
                            onClick={() => setMenu(false)}
                            key={href}
                            href={href}
                            className="rounded-md px-2.5 py-2 text-[13px] font-medium text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
                {preview ? (
                  <Link
                    href="/preview?state=visitor"
                    className="mt-3 block border-t border-line px-2.5 pt-3 text-[13px] font-medium text-ink-2"
                  >
                    Switch to visitor preview
                  </Link>
                ) : (
                  <form action={logout} className="mt-3 border-t border-line pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
                    >
                      Log out
                    </button>
                  </form>
                )}
              </Popover>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-9 items-center rounded-md px-3 text-[13.5px] font-semibold text-ink-2 transition-colors hover:bg-sunken hover:text-ink sm:inline-flex"
              >
                Log in
              </Link>
              <ButtonLink href="/signup" size="md">
                Join
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
