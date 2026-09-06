import { EmptyState } from "@/components/ui/status-notice";
import Link from "next/link";
import { MemberShell } from "@/components/community/member-shell";
import { SaveTopicButton } from "@/components/community/content-actions";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Saved topics" };
export default async function SavedPage() {
  const { user } = await requireOnboardingComplete();
  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from("saved_topics")
    .select("topic_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Saved topics could not be loaded.");
  const ids = (saved ?? []).map((row) => String(row.topic_id));
  const { data: topics } = ids.length
    ? await supabase
        .from("forum_topics")
        .select("id,title,club_name")
        .in("id", ids)
    : { data: [] };
  const rows = (topics ?? []) as {
    id: string;
    title: string;
    club_name: string | null;
  }[];
  return (
    <MemberShell
      title="Saved topics"
      description="Good debates are worth coming back to."
      active="/me/saved"
    >
      <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {ids
          .map((id) => rows.find((row) => row.id === id))
          .filter((row) => row !== undefined)
          .map((row) => (
            <article
              key={row.id}
              className="flex items-center justify-between gap-4 p-4 sm:p-5"
            >
              <Link
                href={`/?topic=${row.id}`}
                className="min-w-0 text-[14.5px] font-bold text-ink transition-colors hover:text-navy"
              >
                {row.title}
                <span className="mt-0.5 block text-[12px] font-medium text-ink-4">
                  {row.club_name ?? "All football"}
                </span>
              </Link>
              <SaveTopicButton topicId={row.id} initialSaved />
            </article>
          ))}
        {!rows.length && (
          <EmptyState
            title="Nothing saved yet"
            action={{ href: "/", label: "Find a debate" }}
          >
            Save a topic and pick the conversation back up later.
          </EmptyState>
        )}
      </div>
    </MemberShell>
  );
}
