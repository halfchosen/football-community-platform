import { getSourceBadge } from "@/domains/forum/topics";
import { ExternalIcon } from "@/components/ui/icons";

const className =
  "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-4";

export function SourceBadge({ sourceUrl }: { sourceUrl: string | null }) {
  const badge = getSourceBadge(sourceUrl);

  if (sourceUrl) {
    return (
      <a
        aria-label="Open source link"
        className={`${className} rounded outline-none transition-colors hover:text-navy focus-visible:ring-2 focus-visible:ring-navy/35`}
        href={sourceUrl}
        rel="noopener noreferrer nofollow ugc"
        target="_blank"
      >
        {badge.label}
        <ExternalIcon size={11} />
      </a>
    );
  }

  return <span className={className}>{badge.label}</span>;
}
