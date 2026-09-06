import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/guards";
import { acceptAgreements } from "@/server/actions/community/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusNotice } from "@/components/ui/status-notice";
import { isCommunityLaunchReady } from "@/lib/community/legal";
export default async function AgreementsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const { error } = await searchParams;
  const open =
    isCommunityLaunchReady() || process.env.NODE_ENV !== "production";
  return (
    <AppShell>
      <section className="mx-auto max-w-md rounded-xl border border-line bg-surface p-6 sm:p-7">
        <p className="t-eyebrow">Before your next take</p>
        <h1 className="mt-2 t-page-title text-ink">Know where you stand</h1>
        <p className="mb-5 mt-2 text-[13.5px] leading-6 text-ink-3">
          Membership, deletion and review have changed. Have a read before you
          carry on.
        </p>
        {!open && (
          <div className="mb-5">
            <StatusNotice title="Policies are being finalised" compact>
              Keep browsing — registration and participation reopen once the
              launch policies are published.
            </StatusNotice>
          </div>
        )}
        <form action={acceptAgreements} className="grid gap-4">
          {error && (
            <p role="alert" className="text-[13px] font-medium text-danger">
              {error}
            </p>
          )}
          {[
            ["terms", "I agree to the", "Terms of Use"],
            ["rules", "I accept the", "Community Rules"],
            ["privacy", "I have read the", "Privacy Notice"],
          ].map(([key, prefix, label]) => (
            <label
              key={key}
              className="flex items-start gap-3 rounded-md border border-line bg-sunken p-3.5 text-[13px] leading-6 text-ink-2 transition-colors has-[:checked]:border-accent-line has-[:checked]:bg-accent-wash"
            >
              <input
                type="checkbox"
                name={key}
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
              />
              <span>
                {prefix}{" "}
                <Link
                  href={`/legal/${key}`}
                  target="_blank"
                  className="font-semibold text-navy underline"
                >
                  {label}
                </Link>
                .
              </span>
            </label>
          ))}
          <SubmitButton className="w-full" disabled={!open}>
            Continue
          </SubmitButton>
        </form>
      </section>
    </AppShell>
  );
}
