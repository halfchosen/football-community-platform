import Link from "next/link";
import { signOutEverywhere } from "@/server/actions/auth/change-email";
import { MemberShell } from "@/components/community/member-shell";
import {
  ChangePasswordForm,
  ChangeEmailForm,
  DeleteAccountForm,
} from "@/components/settings/account-security-forms";
import { SubmitButton } from "@/components/ui/submit-button";
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
      description="Sign-in, personal data, and the controls that close it all down."
      active="/settings/account"
    >
      <section className="settings-grid">
        <div className="settings-section">
          <h2 className="t-section text-ink">Email address</h2>
          <p className="mt-1.5 text-[13.5px] font-medium text-ink-2">
            {user.email}
          </p>
          <p className="mt-2 text-xs leading-6 text-ink-4">
            Used to sign in. Never shown on your public profile.
          </p>
          <details className="mt-4">
            <summary className="text-[13px] font-semibold text-navy hover:underline">
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
              className={`mt-3 text-[13px] leading-6 ${emailError ? "text-danger" : "text-accent-strong"}`}
            >
              {emailError ?? emailMessage}
            </p>
          )}
        </div>
        <div className="settings-section">
          <div className="mb-4">
            <h2 className="t-section text-ink">Password</h2>
            <p className="mt-1.5 text-[13px] leading-6 text-ink-3">
              Changing it signs you out everywhere else.
            </p>
          </div>
          {hasEmailPassword ? (
            <ChangePasswordForm error={passwordError} />
          ) : (
            <p className="rounded-md border border-line bg-sunken px-3.5 py-3 text-[13px] leading-6 text-ink-2">
              This account signs in through a social provider and has no email
              password.
            </p>
          )}
        </div>
        <div className="settings-section">
          <h2 className="t-section text-ink">Your data</h2>
          <p className="mb-4 mt-1.5 text-[13px] leading-6 text-ink-3">
            Profile, posts, replies, ratings, saved topics and agreement
            receipts, as JSON.
          </p>
          <a
            href="/api/account/export"
            className="inline-flex h-9 items-center rounded-md bg-navy px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-strong"
          >
            Download my data
          </a>
          <div className="mt-4 flex flex-wrap gap-4 text-[12.5px] font-semibold text-ink-3">
            <Link className="hover:text-navy" href="/legal/privacy">
              Privacy Notice
            </Link>
            <Link className="hover:text-navy" href="/me/activity?view=deleted">
              Recently deleted posts
            </Link>
          </div>
        </div>
        <form action={signOutEverywhere} className="settings-section">
          <h2 className="t-section text-ink">Signed-in devices</h2>
          <p className="mb-4 mt-1.5 text-[13px] leading-6 text-ink-3">
            Ends every session, including this one.
          </p>
          <SubmitButton variant="secondary" pendingLabel="Signing out…">
            Log out everywhere
          </SubmitButton>
        </form>
        <div className="settings-section border-danger-line lg:col-span-2">
          <div className="mb-5 grid gap-1.5">
            <p className="t-eyebrow text-danger">Danger zone</p>
            <h2 className="t-section text-ink">Delete account</h2>
            <p className="text-[13px] leading-6 text-ink-2">
              Your account is frozen and your posts are hidden immediately. You
              have 30 days to change your mind before permanent erasure. Sign in
              and explicitly restore your account during that period. You can
              also choose immediate erasure. Restricted records under a
              documented legal hold are handled separately.
            </p>
            {!hasEmailPassword ? (
              <p className="text-[13px] leading-6 text-ink-3">
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
