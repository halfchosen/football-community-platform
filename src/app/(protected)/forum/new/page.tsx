import Link from "next/link";
import { FeedShell } from "@/components/layout/feed-shell";
import { FeedRail } from "@/components/forum/feed-rail";
import { TopicForm } from "@/components/forum/topic-form";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getCurrentClubOptions } from "@/lib/db/queries/clubs";
import { getEligibleClubIds } from "@/server/services/forum-participation";

export const metadata = { title: "Start a topic" };

export default async function NewTopicPage() {
  const { user } = await requireOnboardingComplete();
  const clubs = await getCurrentClubOptions();
  const eligibleClubIds = await getEligibleClubIds(user.id, clubs);

  return (
    <FeedShell sidebar={<FeedRail />}>
      <div className="grid gap-4">
        <Link
          className="text-sm font-bold text-slate-400 transition hover:text-violet-600"
          href="/"
        >
          ← Back to feed
        </Link>
        <header className="grid gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Start a topic
          </h1>
          <p className="text-sm font-medium leading-relaxed text-slate-500">
            Share your take. Pick a type, write your own commentary, and link a
            source if you&apos;re making a claim.
          </p>
        </header>
        <TopicForm clubs={clubs} eligibleClubIds={eligibleClubIds} />
      </div>
    </FeedShell>
  );
}
