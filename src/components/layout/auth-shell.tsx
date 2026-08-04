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
          <Link className="inline-flex items-center gap-2 lg:hidden" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-lg text-white">
              ⚽
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              futbol<span className="text-violet-600">community</span>
            </span>
          </Link>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-violet-900/5 sm:p-8 lg:mt-0">
            <div className="grid gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="text-sm leading-6 text-slate-500">{description}</p>
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
    <aside className="relative hidden w-1/2 max-w-xl flex-col justify-between overflow-hidden bg-violet-700 p-12 text-white lg:flex">
      {/* Pitch motif */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white" />
        <div className="absolute left-1/2 top-1/2 h-32 w-56 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-white" />
      </div>
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />

      <Link className="relative inline-flex items-center gap-2.5" href="/">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-xl ring-1 ring-white/20">
          ⚽
        </span>
        <span className="text-xl font-extrabold tracking-tight">
          futbolcommunity
        </span>
      </Link>

      <div className="relative max-w-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-violet-200">
          Your football identity
        </p>
        <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">
          Pick your club. Climb the ranks.
        </h2>
        <p className="mt-4 leading-7 text-violet-100/85">
          Join supporters across the world, earn your generation badge, and
          grow from Supporter to Club Legend.
        </p>
      </div>

      <div className="relative flex flex-wrap gap-x-8 gap-y-3 text-sm text-violet-100/85">
        <span className="inline-flex items-center gap-2">🛡️ Club identity</span>
        <span className="inline-flex items-center gap-2">🏅 Generation badges</span>
        <span className="inline-flex items-center gap-2">⭐ Levels &amp; titles</span>
      </div>
    </aside>
  );
}
