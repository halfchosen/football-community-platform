import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { TopicDetail } from "@/components/forum/topic-detail";
import {
  demoTopicSourced,
  demoTopicUnsourcedClaim,
} from "@/app/zzpreview/_mock/forum";

// Preview of /forum/[topicId] — both variants stacked: a sourced topic with
// its link card, and an unsourced news-like topic with the strong badge.
export default function ForumTopicPreviewPage() {
  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-3xl gap-10">
        <Link
          className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-900"
          href="/zzpreview/forum"
        >
          ← Back to forum preview
        </Link>

        <section className="grid gap-4">
          <p className="w-fit rounded-full bg-stone-200/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
            Variant 1 · sourced topic
          </p>
          <TopicDetail topic={demoTopicSourced} />
        </section>

        <hr className="border-stone-200" />

        <section className="grid gap-4">
          <p className="w-fit rounded-full bg-stone-200/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
            Variant 2 · unsourced news-like claim
          </p>
          <TopicDetail topic={demoTopicUnsourcedClaim} />
        </section>
      </div>
    </AppShell>
  );
}
