import { AppShell } from "@/components/layout/app-shell";
import { requireOnboardingComplete } from "@/lib/auth/guards";

export default async function AccountSettingsPage() {
  const { user } = await requireOnboardingComplete();

  return (
    <AppShell>
      <section className="grid max-w-2xl gap-6">
        <header className="grid gap-2 border-b border-stone-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Settings
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-950">
            Account
          </h1>
        </header>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm font-semibold text-stone-950">Email address</p>
          <p className="mt-2 text-stone-600">{user.email}</p>
          <p className="mt-3 text-xs leading-relaxed text-stone-400">
            This is the email you use to sign in. It is never shown on your
            public profile.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
