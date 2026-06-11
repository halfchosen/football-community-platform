import Link from "next/link";
import type { TopicListItem } from "@/lib/db/queries/topics";
import { topicTypeLabel } from "@/domains/forum/topics";
import { SourceBadge } from "@/components/forum/source-badge";

type TopicCardProps = {
  topic: TopicListItem;
  /** Where the card links to; previews point into the preview hub. */
  href?: string;
};

export function TopicCard({ topic, href }: TopicCardProps) {
  const authorName = topic.authorDisplayName ?? topic.authorUsername;

  return (
    <Link
      className="group grid gap-2.5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
      href={href ?? `/forum/${topic.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-700/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          {topicTypeLabel(topic.topicType)}
        </span>
        <SourceBadge sourceUrl={topic.sourceUrl} topicType={topic.topicType} />
      </div>
      <h3 className="font-serif text-xl font-bold leading-snug text-stone-950 group-hover:text-emerald-950">
        {topic.title}
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-stone-500">
        {topic.body}
      </p>
      <p className="text-xs text-stone-400">
        {authorName} · @{topic.authorUsername}
        {topic.authorClubName ? ` · ${topic.authorClubName}` : ""} ·{" "}
        {formatTopicDate(topic.createdAt)}
      </p>
    </Link>
  );
}

export function formatTopicDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
