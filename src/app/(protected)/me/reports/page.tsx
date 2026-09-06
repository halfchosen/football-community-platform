import { MemberShell } from "@/components/community/member-shell";
import { ReportDecisionForm } from "@/components/community/content-actions";
import { requireUser } from "@/lib/auth/guards";
import { getReports } from "@/lib/community/queries";
export const metadata = { title: "My reports" };
export default async function ReportsPage() {
  const user = await requireUser();
  const reports = await getReports(user.id);
  return (
    <MemberShell
      title="My reports"
      description="Follow a report, read the decision, or ask for another review."
      active="/me/reports"
    >
      <div className="grid gap-4">
        {reports.length ? (
          reports.map((report) => (
            <article
              key={report.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold">Report {report.id.slice(0, 8)}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">
                  {report.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {report.details}
              </p>
              {report.decision && (
                <p className="mt-3 rounded-lg bg-accent-soft p-3 text-sm leading-6 text-navy-strong">
                  {report.decision}
                </p>
              )}
              {report.decision && !report.appeal && (
                <ReportDecisionForm id={report.id} appeal />
              )}
            </article>
          ))
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            You have no reports. Every post has a Report action when something
            needs our attention.
          </p>
        )}
      </div>
    </MemberShell>
  );
}
