import { TopicCard } from "@/components/forum/topic-card";
import type { FeedTopic } from "@/lib/db/queries/feed";

type PublicProfileActivityProps = {
  topics: FeedTopic[];
  authorHref?: string;
};

export function PublicProfileActivity({
  topics,
  authorHref,
}: PublicProfileActivityProps) {
  return (
    <section aria-labelledby="profile-posts-heading" className="grid gap-3">
      <header className="flex items-center justify-between gap-3">
        <h2
          className="text-lg font-extrabold tracking-tight text-slate-900"
          id="profile-posts-heading"
        >
          Recent posts
        </h2>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-extrabold text-violet-700">
          {topics.length}
        </span>
      </header>

      {topics.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm font-medium text-slate-500">
          No posts yet.
        </p>
      ) : (
        <ul className="grid gap-3">
          {topics.map((topic) => (
            <li key={topic.id}>
              <TopicCard
                authorHref={authorHref}
                contributionCount={topic.contributionCount}
                interactionCount={topic.interactionCount}
                ratingAverage={topic.ratingAverage}
                ratingCount={topic.ratingCount}
                topic={topic}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
