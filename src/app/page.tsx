import { ButtonLink } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="grid content-center gap-8">
            <div className="grid gap-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-800">
                The global football community
              </p>
              <h1 className="max-w-3xl font-serif text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
                Your club. Your colours. Your voice.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                Join supporters from every league in the world. Pick the club
                you live for, earn your generation badge, and climb from
                Supporter to Club Legend.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup">Join the community</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Log in
              </ButtonLink>
            </div>
            <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm font-medium text-stone-600">
              <li className="inline-flex items-center gap-2">🛡️ Club identity</li>
              <li className="inline-flex items-center gap-2">🏅 Generation badges</li>
              <li className="inline-flex items-center gap-2">⭐ Levels &amp; titles</li>
            </ul>
          </div>

          <div className="grid content-center">
            <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg shadow-emerald-950/5">
              <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-10">
                  <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full border-2 border-white" />
                  <div className="absolute -right-2 -top-8 h-32 w-32 rounded-full border-2 border-white" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Supporter profile
                </p>
                <div className="mt-5 flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 font-serif text-xl font-bold ring-1 ring-white/20">
                    MB
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl font-bold">Marco Baggio</h2>
                    <p className="text-sm text-emerald-100">
                      Juventus supporter · Member since 2021
                    </p>
                  </div>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 p-5 pb-4">
                {[
                  ["Generation", "First Generation Writer"],
                  ["Level", "Level 6"],
                  ["Title", "Senior Writer"],
                  ["Badge", "Founding Supporter"],
                ].map(([label, value]) => (
                  <div
                    className="rounded-xl border border-stone-200 bg-stone-50/60 p-4"
                    key={label}
                  >
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      {label}
                    </dt>
                    <dd className="mt-2 font-serif font-bold text-emerald-950">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                  <span>Progress to Level 7</span>
                  <span>640 / 1,000 XP</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-emerald-900/10">
                  <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700" />
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
