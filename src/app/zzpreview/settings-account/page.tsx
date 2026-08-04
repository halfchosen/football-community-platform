import { AppShell } from "@/components/layout/app-shell";
import { DEMO_EMAIL } from "@/app/zzpreview/_mock/data";

// Preview of /settings/account with a demo email.
export default function SettingsAccountPreviewPage() {
  return (
    <AppShell previewNav>
      <section className="grid max-w-2xl gap-6">
        <header className="grid gap-2 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
            Settings
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Account
          </h1>
        </header>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Email address</p>
          <p className="mt-2 text-slate-600">{DEMO_EMAIL}</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            This is the email you use to sign in. It is never shown on your
            public profile.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
