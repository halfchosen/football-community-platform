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
      description="Replies to your takes, and word from the community team."
      active="/me/notifications"
    >
      {items.some((item) => !item.read_at) && <ReadNotificationsButton />}
      <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {items.length ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.topic_id ? `/?topic=${item.topic_id}` : "/me/reports"}
              className={`block border-l-2 p-4 transition-colors hover:bg-sunken sm:p-5 ${
                item.read_at
                  ? "border-transparent"
                  : "border-accent bg-accent-wash/50"
              }`}
            >
              <p className="text-[13.5px] leading-6 text-ink-2">
                {item.message}
              </p>
              <time className="mt-1.5 block text-[12px] text-ink-4">
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
            action={{ href: "/", label: "Find a debate" }}
          >
            Replies and community updates land here.
          </EmptyState>
        )}
      </div>
    </MemberShell>
  );
}
