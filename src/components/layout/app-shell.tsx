import type { ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/server/actions/auth/logout";

type AppShellProps = {
  children: ReactNode;
  /**
   * Preview-only mode: nav links point to the /zzpreview counterparts instead
   * of the real protected routes (which would bounce to login), and "Log out"
   * becomes a link back to the preview hub.
   */
  previewNav?: boolean;
};

export function AppShell({ children, previewNav = false }: AppShellProps) {
  const homeHref = previewNav ? "/zzpreview" : "/";
  const feedHref = previewNav ? "/zzpreview/feed" : "/";
  const profileHref = previewNav
    ? "/zzpreview/settings-profile"
    : "/settings/profile";
  const accountHref = previewNav
    ? "/zzpreview/settings-account"
    : "/settings/account";

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-violet-900/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="inline-flex items-center gap-2" href={homeHref}>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-600 text-base text-white shadow-sm shadow-violet-600/25">
              ⚽
            </span>
            <span className="text-[15px] font-extrabold tracking-tight text-slate-900">
              futbol<span className="text-violet-600">community</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold">
            <Link
              className="rounded-full px-3.5 py-1.5 text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
              href={feedHref}
            >
              Feed
            </Link>
            <Link
              className="rounded-full px-3.5 py-1.5 text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
              href={profileHref}
            >
              Edit profile
            </Link>
            <Link
              className="rounded-full px-3.5 py-1.5 text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
              href={accountHref}
            >
              Account
            </Link>
            {previewNav ? (
              <Link
                className="ml-1 rounded-full bg-slate-100 px-4 py-1.5 text-slate-700 transition hover:bg-slate-200"
                href="/zzpreview"
              >
                ← Preview hub
              </Link>
            ) : (
              <form action={logout}>
                <button
                  className="ml-1 rounded-full bg-slate-100 px-4 py-1.5 text-slate-700 transition hover:bg-slate-200"
                  type="submit"
                >
                  Log out
                </button>
              </form>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
