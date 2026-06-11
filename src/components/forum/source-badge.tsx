import { getSourceBadge } from "@/domains/forum/topics";

type SourceBadgeProps = {
  topicType: string;
  sourceUrl: string | null;
};

const badgeStyles = {
  sourced: "bg-emerald-700/10 text-emerald-800 ring-emerald-600/20",
  unsourced: "bg-stone-200/70 text-stone-600 ring-stone-300/60",
  "unsourced-claim": "bg-red-100 text-red-800 ring-red-300/60",
} as const;

const badgeIcons = {
  sourced: "🔗",
  unsourced: "○",
  "unsourced-claim": "⚠️",
} as const;

export function SourceBadge({ topicType, sourceUrl }: SourceBadgeProps) {
  const badge = getSourceBadge(topicType, sourceUrl);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeStyles[badge.kind]}`}
    >
      <span aria-hidden className="text-[10px]">
        {badgeIcons[badge.kind]}
      </span>
      {badge.label}
    </span>
  );
}
