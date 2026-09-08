import { TopicCard } from "@/components/forum/topic-card";
import type { FeedTopic } from "@/lib/db/queries/feed";

type PublicProfileActivityProps = {
  topics: FeedTopic[];
  authorHref?: string;
  preview?: boolean;
};

export function PublicProfileActivity({
  topics,
  authorHref,
  preview = false,
}: PublicProfileActivityProps) {
  return (
    <section aria-labelledby="profile-posts-heading" className="grid gap-3">
      <header className="flex items-center justify-between gap-3">
        <h2 className="t-section text-ink" id="profile-posts-heading">
          Recent posts
        </h2>
        <span className="text-[12.5px] font-semibold tabular-nums text-ink-4">
          {topics.length}
        </span>
      </header>

      {topics.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong bg-surface px-5 py-8 text-center text-[13px] font-medium text-ink-3">
          No posts yet.
        </p>
      ) : (
        <ul className="feed-stream">
          {topics.map((topic) => (
            <li key={topic.id}>
              <TopicCard
                authorHref={authorHref}
                href={
                  preview
                    ? `/preview?state=writer&topic=${topic.id}`
                    : undefined
                }
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
