import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { TopicCard } from "@/components/forum/topic-card";
import { demoTopics } from "@/app/zzpreview/_mock/forum";

// Preview of /forum with one demo topic per source-badge state.
export default function ForumPreviewPage() {
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
          <ButtonLink href="/zzpreview/forum-new">Start a topic</ButtonLink>
        </header>
        <ul className="grid gap-4">
          {demoTopics.map((topic) => (
            <li key={topic.id}>
              <TopicCard href="/zzpreview/forum-topic" topic={topic} />
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
