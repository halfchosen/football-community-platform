import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <BrandPanel />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-md">
          <Link
            className="inline-flex items-center gap-2.5 lg:hidden"
            href="/"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-lg text-white">
              ⚽
            </span>
            <span className="font-serif text-lg font-bold text-emerald-950">
              Football Community
            </span>
          </Link>
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 lg:mt-0">
            <div className="grid gap-2">
              <h1 className="font-serif text-3xl font-bold text-stone-950">
                {title}
              </h1>
              <p className="text-sm leading-6 text-stone-600">{description}</p>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden w-1/2 max-w-xl flex-col justify-between overflow-hidden bg-emerald-950 p-12 text-white lg:flex">
      {/* Pitch motif */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white" />
        <div className="absolute left-1/2 top-1/2 h-32 w-56 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-white" />
      </div>
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

      <Link className="relative inline-flex items-center gap-2.5" href="/">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl ring-1 ring-white/20">
          ⚽
        </span>
        <span className="font-serif text-xl font-bold">Football Community</span>
      </Link>

      <div className="relative max-w-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
          Your football identity
        </p>
        <h2 className="mt-4 font-serif text-4xl font-bold leading-tight">
          Wear your colours. Climb the ranks.
        </h2>
        <p className="mt-4 leading-7 text-emerald-100/80">
          Pick your club, earn your generation badge, and grow from Supporter to
          Club Legend alongside fans across the world.
        </p>
      </div>

      <div className="relative flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-100/80">
        <span className="inline-flex items-center gap-2">🛡️ Club identity</span>
        <span className="inline-flex items-center gap-2">🏅 Generation badges</span>
        <span className="inline-flex items-center gap-2">⭐ Levels &amp; titles</span>
      </div>
    </aside>
  );
}
