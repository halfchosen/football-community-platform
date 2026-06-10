import type { ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/server/actions/auth/logout";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-[#f6f2e7]/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="inline-flex items-center gap-2.5" href="/app">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-lg text-white">
              ⚽
            </span>
            <span className="font-serif text-xl font-bold text-emerald-950">
              Football Community
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link className="rounded-lg px-3 py-2 text-stone-700 hover:bg-stone-100" href="/settings/profile">
              Edit profile
            </Link>
            <Link className="rounded-lg px-3 py-2 text-stone-700 hover:bg-stone-100" href="/settings/account">
              Account
            </Link>
            <form action={logout}>
              <Button type="submit" variant="secondary">
                Log out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
