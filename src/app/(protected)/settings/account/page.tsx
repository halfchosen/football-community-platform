import Link from "next/link";
import { signOutEverywhere } from "@/server/actions/auth/change-email";
import { MemberShell } from "@/components/community/member-shell";
import {
  ChangePasswordForm,
  ChangeEmailForm,
  DeleteAccountForm,
} from "@/components/settings/account-security-forms";
import { requireUser } from "@/lib/auth/guards";
import {
  getSearchParam,
  type PageSearchParams,
} from "@/lib/utils/search-params";

type AccountSettingsPageProps = {
  searchParams: PageSearchParams;
};

export default async function AccountSettingsPage({
  searchParams,
}: AccountSettingsPageProps) {
  const user = await requireUser();
  const providers = Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers
    : [];
  const hasEmailPassword = providers.includes("email");
  const passwordError = await getSearchParam(searchParams, "passwordError");
  const emailError = await getSearchParam(searchParams, "emailError");
  const emailMessage = await getSearchParam(searchParams, "emailMessage");
  const deleteError = await getSearchParam(searchParams, "deleteError");

  return (
    <MemberShell
      title="Account & privacy"
      description="Your sign-in, personal data and account controls."
      active="/settings/account"
    >
      <section className="settings-grid">
        <div className="settings-section">
          <p className="text-sm font-semibold text-slate-900">Email address</p>
          <p className="mt-2 text-slate-600">{user.email}</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            This is the email you use to sign in. It is never shown on your
            public profile.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-navy">
              Change email
            </summary>
            <ChangeEmailForm
              requiresPassword={hasEmailPassword}
              error={emailError}
              message={emailMessage}
            />
          </details>
          {(emailError || emailMessage) && (
            <p
              role={emailError ? "alert" : "status"}
              className="mt-3 text-sm leading-6"
            >
              {emailError ?? emailMessage}
            </p>
          )}
        </div>
        <div className="settings-section">
          <div className="mb-5 grid gap-1.5">
            <h2 className="text-lg font-bold text-slate-900">Password</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Changing your password ends refresh sessions on every device.
              Existing access tokens expire shortly afterward.
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
        <div className="settings-section">
          <h2 className="text-lg font-bold">Your data</h2>
          <p className="my-3 text-sm leading-6 text-slate-500">
            Download your profile, posts, replies, ratings, saved topics, and
            agreement receipts as JSON.
          </p>
          <a
            href="/api/account/export"
            className="inline-flex rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white"
          >
            Download my data
          </a>
          <div className="mt-4 flex gap-4 text-xs font-semibold text-navy">
            <Link href="/legal/privacy">Privacy Notice</Link>
            <Link href="/me/activity?view=deleted">Recently deleted posts</Link>
          </div>
        </div>
        <form action={signOutEverywhere} className="settings-section">
          <h2 className="font-bold">Signed-in devices</h2>
          <p className="my-3 text-sm leading-6 text-slate-500">
            End sessions on every device, including this one. You will need to
            sign in again.
          </p>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
            Log out everywhere
          </button>
        </form>
        <div className="settings-section lg:col-span-2">
          <div className="mb-5 grid gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              Danger zone
            </p>
            <h2 className="text-lg font-bold text-slate-900">Delete account</h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Your account is frozen and your posts are hidden immediately. You
              have 30 days to change your mind before permanent erasure. Sign in
              and explicitly restore your account during that period. You can
              also choose immediate erasure. Restricted records under a
              documented legal hold are handled separately.
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
    </MemberShell>
  );
}
