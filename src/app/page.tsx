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
                Sprint 1 foundation
              </p>
              <h1 className="max-w-3xl font-serif text-5xl font-bold leading-tight text-stone-950 sm:text-6xl">
                Build your visible football identity.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                Create an account, choose your club identity, complete onboarding,
                and start from Level 1 as a Supporter.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup">Create account</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Log in
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4 rounded-md border border-emerald-900/15 bg-white p-5 shadow-sm">
            <div className="rounded-md bg-emerald-950 p-5 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
                Example profile
              </p>
              <h2 className="mt-6 font-serif text-3xl font-bold">MarcoBaggio</h2>
              <p className="mt-2 text-emerald-100">Juventus supporter</p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Generation", "First Generation Writer"],
                ["Level", "Level 1"],
                ["Title", "Supporter"],
                ["Badge", "Placeholder"],
              ].map(([label, value]) => (
                <div className="rounded-md border border-stone-200 p-4" key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {label}
                  </dt>
                  <dd className="mt-2 font-semibold text-stone-950">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}
