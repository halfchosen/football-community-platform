"use client";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "./brand";
import { Popover } from "@/components/ui/popover";
import { ClubAvatar } from "@/components/onboarding/club-avatar";
import { logout } from "@/server/actions/auth/logout";
export type HeaderViewer = {
  name: string;
  profileHref: string;
  staff?: boolean;
};
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
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="site-width grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:gap-6">
        <Brand compact />
        <form
          role="search"
          aria-label="Search discussions"
          action={searchAction}
          method="get"
          className="relative mx-auto w-full max-w-[640px]"
        >
          <button
            type="submit"
            aria-label="Search"
            className="absolute inset-y-0 left-1 grid w-9 place-items-center rounded-lg text-slate-500"
          >
            <svg
              aria-hidden
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
          </button>
          <input
            name="q"
            type="search"
            key={searchValue}
            defaultValue={searchValue}
            aria-label="Search discussions or clubs"
            placeholder="Search discussions or #club"
            className="h-11 w-full rounded-xl border border-line bg-background pl-10 pr-3 text-sm outline-none transition focus:border-teal focus:bg-white focus:ring-2 focus:ring-mint"
          />
        </form>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-1 sm:gap-3"
        >
          {viewer ? (
            <>
              <Link
                href="/me/notifications"
                aria-label="Notifications"
                className="hidden rounded-lg p-2.5 text-slate-500 hover:bg-accent-soft sm:inline-flex"
              >
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>
              </Link>
              <Popover
                open={menu}
                onOpenChange={setMenu}
                label="Your account"
                className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-navy hover:bg-slate-100"
                trigger={
                  <>
                    <ClubAvatar name={viewer.name} />
                    <span className="hidden max-w-28 truncate xl:inline">
                      {viewer.name}
                    </span>
                    <span aria-hidden>⌄</span>
                  </>
                }
              >
                <nav aria-label="Account navigation" className="grid gap-1">
                  {[
                    [viewer.profileHref, "View profile"],
                    ["/me/activity", "My activity"],
                    ["/me/saved", "Saved topics"],
                    ["/me/notifications", "Notifications"],
                    ["/me/reports", "My reports"],
                    ["/settings/profile", "Football identity"],
                    ["/settings/account", "Account & privacy"],
                    ...(viewer.staff
                      ? [
                          ["/admin/reports", "Review reports"],
                          ["/admin/members", "Members & admission"],
                        ]
                      : []),
                  ].map(([href, label]) => (
                    <Link
                      onClick={() => setMenu(false)}
                      key={href}
                      href={href}
                      className="rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-accent-soft hover:text-navy"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                {preview ? (
                  <Link
                    href="/preview?state=visitor"
                    className="mt-2 block border-t border-line px-3 py-3 text-sm text-navy"
                  >
                    Switch to visitor preview
                  </Link>
                ) : (
                  <form
                    action={logout}
                    className="mt-2 border-t border-line pt-2"
                  >
                    <button
                      type="submit"
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-navy hover:bg-slate-100"
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
                className="rounded-lg px-2 py-2.5 text-sm font-semibold text-navy hover:bg-slate-100 sm:px-3"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-navy px-3 py-2.5 text-sm font-semibold text-white hover:bg-navy-strong sm:px-5"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
