import { getSourceBadge } from "@/domains/forum/topics";

type SourceBadgeProps = {
  topicType: string;
  sourceUrl: string | null;
};

const badgeStyles = {
  sourced: "bg-emerald-100 text-emerald-700",
  unsourced: "bg-slate-100 text-slate-500",
  "unsourced-claim": "bg-rose-100 text-rose-700",
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
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${badgeStyles[badge.kind]}`}
    >
      <span aria-hidden className="text-[9px]">
        {badgeIcons[badge.kind]}
      </span>
      {badge.label}
    </span>
  );
}
