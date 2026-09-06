import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { WRITER_STATUSES } from "@/domains/community/policy";
export const metadata = { title: "How the community works" };
export default function CommunityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-width reading-page py-10">
        <header className="relative overflow-hidden rounded-2xl bg-navy-strong p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-teal">
            Your club. Your colours. Your voice.
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
            The match ends.
            <br />
            The conversation doesn’t.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-mint">
            One topic. A crowd of takes. Find your club, bring your angle, and
            give the other side something to reply to.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex rounded-lg bg-teal px-5 py-3 text-sm font-bold text-navy-strong"
          >
            Find your place →
          </Link>
        </header>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-navy">
              Permanent legacy
            </p>
            <h2 className="mt-2 text-2xl font-bold">First Generation</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The first wave has up to 1,000 places per club and 20,000 across
              the community. Your generation and club founding number are
              permanent. Full clubs move to a waiting list. A deleted membership
              never makes its number available again.
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-navy">
              Home and away
            </p>
            <h2 className="mt-2 text-2xl font-bold">Rivals welcome</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Start topics for the clubs you support. Join rival debates with a
              daily away allowance: one post and three replies per club. Rate
              the take, respect the writer, and let other voices in.
            </p>
            <Link
              href="/legal/rules"
              className="mt-4 inline-block text-sm font-bold text-navy"
            >
              See the participation rules →
            </Link>
          </section>
        </div>
        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            A reputation, built over matchdays
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Your voice grows through consistent contributions and
            independent ratings. Your generation stays exactly where it started.
          </p>
          <ol className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {WRITER_STATUSES.map((status, index) => (
              <li key={status.name} className="flex gap-5 p-5">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${index === 4 ? "bg-mint text-navy" : "bg-accent-soft text-navy"}`}
                >
                  {["S", "R", "V", "L", "C"][index]}
                </span>
                <div>
                  <h3 className="font-bold">{status.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {status.description}
                  </p>
                  {status.posts !== null && status.posts > 0 && (
                    <p className="mt-2 text-xs text-slate-400">
                      {status.posts} active posts · {status.days} contributing
                      days
                      {status.raters
                        ? ` · ${status.raters} independent raters · 6/10 average`
                        : ""}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
