import type { TopicListItem } from "@/lib/db/queries/topics";
import {
  isNewsLikeType,
  topicTypeLabel,
  UNSOURCED_NEWS_WARNING,
} from "@/domains/forum/topics";
import { SourceBadge } from "@/components/forum/source-badge";
import { SourceCard } from "@/components/forum/source-card";
import { formatTopicDate } from "@/components/forum/topic-card";

type TopicDetailProps = {
  topic: TopicListItem;
};

export function TopicDetail({ topic }: TopicDetailProps) {
  const authorName = topic.authorDisplayName ?? topic.authorUsername;

  return (
    <article className="grid gap-6">
      <header className="grid gap-3 border-b border-stone-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-700/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            {topicTypeLabel(topic.topicType)}
          </span>
          <SourceBadge sourceUrl={topic.sourceUrl} topicType={topic.topicType} />
        </div>
        <h1 className="font-serif text-3xl font-bold leading-tight text-stone-950 sm:text-4xl">
          {topic.title}
        </h1>
        <p className="text-sm text-stone-500">
          {authorName} · @{topic.authorUsername}
          {topic.authorTitleName ? ` · ${topic.authorTitleName}` : ""}
          {topic.authorClubName ? ` · ${topic.authorClubName}` : ""} ·{" "}
          {formatTopicDate(topic.createdAt)}
        </p>
      </header>

      {!topic.sourceUrl && isNewsLikeType(topic.topicType) ? (
        <p className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
          <span aria-hidden className="mt-px">⚠️</span>
          {UNSOURCED_NEWS_WARNING}
        </p>
      ) : null}

      <div className="whitespace-pre-line leading-relaxed text-stone-800">
        {topic.body}
      </div>

      {topic.sourceUrl ? (
        <SourceCard
          sourceDomain={topic.sourceDomain}
          sourceTitle={topic.sourceTitle}
          sourceUrl={topic.sourceUrl}
        />
      ) : null}
    </article>
  );
}
