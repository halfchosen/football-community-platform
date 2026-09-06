import { MemberShell } from "@/components/community/member-shell";
import { ReportDecisionForm } from "@/components/community/content-actions";
import { EmptyState } from "@/components/ui/status-notice";
import { requireUser } from "@/lib/auth/guards";
import { getReports } from "@/lib/community/queries";
export const metadata = { title: "My reports" };
export default async function ReportsPage() {
  const user = await requireUser();
  const reports = await getReports(user.id);
  return (
    <MemberShell
      title="My reports"
      description="Follow a report, read the decision, ask for another look."
      active="/me/reports"
    >
      <div className="grid gap-4">
        {reports.length ? (
          reports.map((report) => (
            <article
              key={report.id}
              className="rounded-lg border border-line bg-surface p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="t-section text-ink">
                  Report {report.id.slice(0, 8)}
                </h2>
                <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-bold capitalize text-ink-3">
                  {report.status}
                </span>
              </div>
              <p className="mt-2.5 text-[13.5px] leading-6 text-ink-2">
                {report.details}
              </p>
              {report.decision && (
                <p className="mt-3 rounded-md border border-accent-line bg-accent-wash p-3 text-[13px] leading-6 text-accent-strong">
                  {report.decision}
                </p>
              )}
              {report.decision && !report.appeal && (
                <ReportDecisionForm id={report.id} appeal />
              )}
            </article>
          ))
        ) : (
          <EmptyState compact title="No reports">
            Every post has a Report action in its menu when something needs our
            attention.
          </EmptyState>
        )}
      </div>
    </MemberShell>
  );
}
