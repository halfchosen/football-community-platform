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
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {ids
          .map((id) => rows.find((row) => row.id === id))
          .filter((row) => row !== undefined)
          .map((row) => (
            <article
              key={row.id}
              className="flex items-center justify-between gap-4 p-5"
            >
              <Link
                href={`/?topic=${row.id}`}
                className="font-bold text-slate-800 hover:text-navy"
              >
                {row.title}
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  {row.club_name ?? "All football"}
                </span>
              </Link>
              <SaveTopicButton topicId={row.id} initialSaved />
            </article>
          ))}
        {!rows.length && (
          <EmptyState
            title="Nothing saved yet"
            action={{ href: "/", label: "Explore discussions" }}
          >
            Save a topic to pick up the conversation later.
          </EmptyState>
        )}
      </div>
    </MemberShell>
  );
}
