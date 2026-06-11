import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell>
      <div className="mx-auto grid w-full max-w-3xl gap-8">
        <header className="grid gap-2 border-b border-stone-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Forum
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-950">
            Start a topic
          </h1>
          <p className="max-w-2xl leading-7 text-stone-600">
            Share your take with the community. Pick a type, write your own
            commentary, and link a source if you&apos;re making a claim.
          </p>
        </header>
        <TopicForm clubs={clubs} eligibleClubIds={eligibleClubIds} />
      </div>
    </AppShell>
  );
}
