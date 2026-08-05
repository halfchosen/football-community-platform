import Link from "next/link";
import { FeedShell } from "@/components/layout/feed-shell";
import { TopicSidebar } from "@/components/forum/topic-sidebar";
import { demoSidebarItems } from "@/app/zzpreview/_mock/forum";
import { TopicPreviewExperience } from "@/app/zzpreview/feed/topic/topic-preview-experience";
import { getAuthenticatedUser } from "@/lib/auth/guards";

// The single canonical topic preview: a sourced club topic with its opening
// entry, comments, reply, ratings, and guest participation state. Preview
// interactions stay local and never write to Supabase.
export default async function FeedTopicPreviewPage() {
  const user = await getAuthenticatedUser();

  return (
    <FeedShell sidebar={<TopicSidebar items={demoSidebarItems} variant="rail" />}>
      <div className="grid gap-4">
        <Link
          className="text-sm font-bold text-slate-400 transition hover:text-violet-600"
          href="/zzpreview/feed"
        >
          ← Back to feed preview
        </Link>
        <TopicPreviewExperience loggedOut={!user} />
      </div>
    </FeedShell>
  );
}
