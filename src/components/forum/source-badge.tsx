import { getSourceBadge } from "@/domains/forum/topics";

type SourceBadgeProps = {
  sourceUrl: string | null;
};

const badgeClassName =
  "inline-flex h-5 min-w-[3.75rem] items-center justify-center rounded-md bg-slate-100 px-2 text-[10px] font-semibold text-slate-500";

export function SourceBadge({ sourceUrl }: SourceBadgeProps) {
  const badge = getSourceBadge(sourceUrl);

  if (sourceUrl) {
    return (
      <a
        aria-label="Open source link"
        className={`${badgeClassName} outline-none transition hover:bg-slate-200 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2`}
        href={sourceUrl}
        rel="noopener noreferrer nofollow ugc"
        target="_blank"
      >
        {badge.label}
      </a>
    );
  }

  return <span className={badgeClassName}>{badge.label}</span>;
}
