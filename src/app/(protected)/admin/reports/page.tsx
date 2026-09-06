import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberShell } from "@/components/community/member-shell";
import { ReportDecisionForm } from "@/components/community/content-actions";
import { EmptyState } from "@/components/ui/status-notice";
import { ArrowRightIcon } from "@/components/ui/icons";
import { requireUser } from "@/lib/auth/guards";
import { getReports, isCommunityStaff } from "@/lib/community/queries";
export const metadata = { title: "Community review" };
export default async function ModerationPage() {
  const user = await requireUser();
  if (!(await isCommunityStaff())) notFound();
  const reports = await getReports(user.id, true);
  return (
    <MemberShell
      title="Community review"
      description="Read the context, record a reason, tell the people affected. A report never removes a post on its own."
      active="/admin/reports"
    >
      <Link
        href="/admin/members"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:underline"
      >
        Members & admission
        <ArrowRightIcon size={14} />
      </Link>
      <div className="grid gap-4">
        {reports.length ? (
          reports.map((report) => (
            <article
              key={report.id}
              className="rounded-lg border border-line bg-surface p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="t-section capitalize text-ink">
                  {report.reason}
                </h2>
                <span className="t-eyebrow">{report.status}</span>
              </div>
              <p className="mt-2 text-[13.5px] leading-6 text-ink-2">
                {report.details}
              </p>
              <blockquote className="mt-3 whitespace-pre-wrap rounded-md border-l-2 border-line-strong bg-sunken p-3.5 text-[13px] leading-6 text-ink-2">
                {report.evidence ?? "Evidence retention period has ended."}
              </blockquote>
              {report.appeal && (
                <p className="mt-3 text-[13px] leading-6 text-ink-2">
                  <span className="font-semibold text-ink">Appeal:</span>{" "}
                  {report.appeal}
                </p>
              )}
              <ReportDecisionForm id={report.id} />
            </article>
          ))
        ) : (
          <EmptyState compact title="Queue is clear">
            Nothing waiting for review.
          </EmptyState>
        )}
      </div>
    </MemberShell>
  );
}
