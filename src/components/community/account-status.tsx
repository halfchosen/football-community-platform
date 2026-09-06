import Link from "next/link";
import { StatusNotice } from "@/components/ui/status-notice";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
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
    <section className="mx-auto grid w-full max-w-xl gap-5 rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div>
        <p className="t-eyebrow">Account & privacy</p>
        <h1 className="mt-2 t-page-title text-ink">
        {waitlisted
          ? "You’re on the waiting list"
          : recoverable
            ? "Your account is on hold"
            : state === "suspended"
              ? "Your account needs a review"
              : "Your account is closed"}
        </h1>
      </div>
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
        <ButtonLink
          className="w-fit"
          href={preview ? "/preview?screen=onboarding" : "/onboarding"}
          size="lg"
        >
          Review my application
        </ButtonLink>
      )}
      <nav
        aria-label="Account options"
        className="grid border-t border-line pt-4"
      >
        {[
          ["/", "Browse discussions"],
          ["/settings/account", "Deletion & data download"],
          ["/me/reports", "Decisions & appeals"],
          ["/legal/privacy", "Privacy & contact"],
        ].map(([href, label]) => (
          <Link
            className="group flex items-center justify-between gap-2 py-2 text-[13.5px] font-semibold text-ink-2 transition-colors hover:text-navy"
            href={href}
            key={href}
          >
            {label}
            <ArrowRightIcon
              size={14}
              className="text-ink-4 transition-colors group-hover:text-navy"
            />
          </Link>
        ))}
      </nav>
    </section>
  );
}
