import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TopicDetail } from "@/components/forum/topic-detail";
import { requireOnboardingComplete } from "@/lib/auth/guards";
import { getTopicById } from "@/lib/db/queries/topics";

type TopicPageProps = {
  params: Promise<{ topicId: string }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  await requireOnboardingComplete();
  const { topicId } = await params;
  const topic = await getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <Link
          className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-900"
          href="/forum"
        >
          ← Back to forum
        </Link>
        <TopicDetail topic={topic} />
      </div>
    </AppShell>
  );
}
