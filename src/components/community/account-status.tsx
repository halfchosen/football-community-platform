import Link from "next/link";
import { StatusNotice } from "@/components/ui/status-notice";
import { RecoverAccountButton } from "./content-actions";
export function AccountStatus({
  state,
  recoverable = false,
  deletionDate,
  preview = false,
}: {
  state: string;
  recoverable?: boolean;
  deletionDate?: string | null;
  preview?: boolean;
}) {
  const waitlisted = state === "waitlisted";
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-5 rounded-2xl border border-line bg-white p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-navy">
        Account & privacy
      </p>
      <h1 className="text-3xl font-bold text-navy">
        {waitlisted
          ? "You’re on the waiting list"
          : recoverable
            ? "Your account is on hold"
            : state === "suspended"
              ? "Your account needs a review"
              : "Your account is closed"}
      </h1>
      <StatusNotice
        title={
          waitlisted
            ? "Your place is pending"
            : recoverable
              ? "Recovery is available"
              : state === "suspended"
                ? "Participation is suspended"
                : "Participation is unavailable"
        }
        tone="info"
      >
        {waitlisted
          ? "Places are limited for each club. You can keep browsing and retry onboarding when a place becomes available."
          : recoverable
            ? `Your posts are hidden and you cannot post or rate. Keep your account before ${deletionDate ? new Date(deletionDate).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "the recovery deadline"} to restore it. Signing in alone does not cancel deletion.`
            : "Read our community rules and check your account decisions for the next step."}
      </StatusNotice>
      {recoverable && <RecoverAccountButton preview={preview} />}
      {waitlisted && (
        <Link
          href={preview ? "/preview?screen=onboarding" : "/onboarding"}
          className="w-fit rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white"
        >
          Review my application
        </Link>
      )}
      <nav
        aria-label="Account options"
        className="grid gap-4 border-t border-line pt-5 text-sm font-semibold text-navy"
      >
        <Link href="/">Browse discussions →</Link>
        <Link href="/settings/account">
          Manage deletion or download my data →
        </Link>
        <Link href="/me/reports">Decisions & appeals →</Link>
        <Link href="/legal/privacy">Privacy & contact →</Link>
      </nav>
    </section>
  );
}
