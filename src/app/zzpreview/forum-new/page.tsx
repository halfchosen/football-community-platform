import { AppShell } from "@/components/layout/app-shell";
import { TopicForm } from "@/components/forum/topic-form";

// Preview of /forum/new. Publishing requires a real session, so nothing can
// be written from here. Pick a news-like type (Transfer, Rumor, News,
// Official, Injury, Finance) and leave the source empty to see the
// unsourced warning live.
export default function ForumNewPreviewPage() {
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
        <TopicForm />
      </div>
    </AppShell>
  );
}
