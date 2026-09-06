import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberShell } from "@/components/community/member-shell";
import { ReportDecisionForm } from "@/components/community/content-actions";
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
      description="Review context, record a reason, and notify the people affected. Reports never automatically remove a post."
      active="/admin/reports"
    >
      <Link
        href="/admin/members"
        className="mb-5 inline-block text-sm font-bold text-navy"
      >
        Members & admission →
      </Link>
      <div className="grid gap-4">
        {reports.length ? (
          reports.map((report) => (
            <article
              key={report.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex justify-between">
                <h2 className="font-bold capitalize">{report.reason}</h2>
                <span className="text-xs uppercase text-slate-400">
                  {report.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6">{report.details}</p>
              <blockquote className="mt-3 whitespace-pre-wrap rounded-lg border-l-2 border-teal bg-accent-soft p-4 text-sm leading-6">
                {report.evidence ?? "Evidence retention period has ended."}
              </blockquote>
              {report.appeal && (
                <p className="mt-3 text-sm">Appeal: {report.appeal}</p>
              )}
              <ReportDecisionForm id={report.id} />
            </article>
          ))
        ) : (
          <p className="rounded-xl bg-white p-8 text-sm text-slate-500">
            The review queue is clear.
          </p>
        )}
      </div>
    </MemberShell>
  );
}
