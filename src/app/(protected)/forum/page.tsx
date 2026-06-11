import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { TopicCard } from "@/components/forum/topic-card";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { listRecentTopics } from "@/lib/db/queries/topics";

export const metadata = { title: "Forum" };

export default async function ForumPage() {
  await requireOnboardingComplete();
  const topics = await listRecentTopics();

  return (
    <AppShell>
      <div className="grid gap-8">
        <header className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
          <div className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Community
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-950">
              Forum
            </h1>
          </div>
          <ButtonLink href="/forum/new">Start a topic</ButtonLink>
        </header>

        {topics.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-700/10 text-2xl">
              💬
            </span>
            <p className="font-serif text-xl font-bold text-stone-900">
              No topics yet
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-stone-500">
              Be the first voice in the community — share a take, a question,
              or a piece of news with a source.
            </p>
            <ButtonLink className="mt-2" href="/forum/new">
              Start the first topic
            </ButtonLink>
          </div>
        ) : (
          <ul className="grid gap-4">
            {topics.map((topic) => (
              <li key={topic.id}>
                <TopicCard topic={topic} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
