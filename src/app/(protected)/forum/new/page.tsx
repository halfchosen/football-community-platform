import Link from "next/link";
import { FeedShell } from "@/components/layout/feed-shell";
import { FeedRail } from "@/components/forum/feed-rail";
import { TopicForm } from "@/components/forum/topic-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
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
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-ink-3 transition-colors hover:text-navy"
          href="/"
        >
          <ArrowLeftIcon size={14} />
          Back to the feed
        </Link>
        <header>
          <h1 className="t-page-title text-ink">Start a topic</h1>
          <p className="mt-1.5 text-[13.5px] leading-6 text-ink-3">
            Name it, make the case, let the crowd answer.
          </p>
        </header>
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
          <TopicForm clubs={clubs} eligibleClubIds={eligibleClubIds} />
        </div>
      </div>
    </FeedShell>
  );
}
