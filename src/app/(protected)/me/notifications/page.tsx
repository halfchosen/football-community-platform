import { EmptyState } from "@/components/ui/status-notice";
import Link from "next/link";
import { MemberShell } from "@/components/community/member-shell";
import { requireUser } from "@/lib/auth/guards";
import { getNotifications } from "@/lib/community/queries";
import { ReadNotificationsButton } from "@/components/community/notification-actions";
export const metadata = { title: "Notifications" };
export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await getNotifications(user.id);
  return (
    <MemberShell
      title="Notifications"
      description="Replies to your takes and updates from the community team."
      active="/me/notifications"
    >
      {items.some((item) => !item.read_at) && <ReadNotificationsButton />}
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.length ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.topic_id ? `/?topic=${item.topic_id}` : "/me/reports"}
              className={`block border-l-2 p-5 transition hover:bg-slate-50 ${item.read_at ? "border-transparent" : "border-teal bg-accent-soft/40"}`}
            >
              <p className="text-sm leading-6 text-slate-700">{item.message}</p>
              <time className="mt-2 block text-xs text-slate-400">
                {new Date(item.created_at).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                })}{" "}
                UTC
              </time>
            </Link>
          ))
        ) : (
          <EmptyState
            title="You’re all caught up"
            action={{ href: "/", label: "Find a conversation" }}
          >
            Replies and community updates will appear here.
          </EmptyState>
        )}
      </div>
    </MemberShell>
  );
}
