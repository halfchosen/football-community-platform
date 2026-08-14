import { AppShell } from "@/components/layout/app-shell";
import {
  ChangePasswordForm,
  DeleteAccountForm,
} from "@/components/settings/account-security-forms";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type AccountSettingsPageProps = {
  searchParams: PageSearchParams;
};

export default async function AccountSettingsPage({
  searchParams,
}: AccountSettingsPageProps) {
  const { user } = await requireOnboardingComplete();
  const providers = Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers
    : [];
  const hasEmailPassword = providers.includes("email");
  const passwordError = await getSearchParam(searchParams, "passwordError");
  const deleteError = await getSearchParam(searchParams, "deleteError");

  return (
    <AppShell>
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
          <p className="mt-2 text-slate-600">{user.email}</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            This is the email you use to sign in. It is never shown on your
            public profile.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-5 grid gap-1.5">
            <h2 className="text-lg font-bold text-slate-900">Password</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Changing your password signs out every active device.
            </p>
          </div>
          {hasEmailPassword ? (
            <ChangePasswordForm error={passwordError} />
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
              This account signs in through a social provider and does not use
              an email password.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
          <div className="mb-5 grid gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              Danger zone
            </p>
            <h2 className="text-lg font-bold text-slate-900">Delete account</h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Your login, profile, settings, club choices, badges, XP history,
              and ratings will be removed. Existing topics, posts, and replies
              stay in the community under “Deleted user” so other
              members&apos; conversations are not erased.
            </p>
            {!hasEmailPassword ? (
              <p className="text-sm leading-relaxed text-slate-600">
                Social-login accounts must have signed in during the last 15
                minutes before deletion.
              </p>
            ) : null}
          </div>
          <DeleteAccountForm
            email={user.email ?? ""}
            error={deleteError}
            requiresPassword={hasEmailPassword}
          />
        </div>
      </section>
    </AppShell>
  );
}
