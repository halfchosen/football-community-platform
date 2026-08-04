type SourceCardProps = {
  sourceUrl: string;
  sourceDomain: string | null;
  sourceTitle: string | null;
};

// Compact link-only source card: domain, optional safe page title, outbound
// link. By design it never shows article text, snippets, or images.
export function SourceCard({ sourceUrl, sourceDomain, sourceTitle }: SourceCardProps) {
  return (
    <a
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 transition hover:border-violet-300 hover:bg-white"
      href={sourceUrl}
      rel="noopener noreferrer nofollow ugc"
      target="_blank"
    >
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-sm"
      >
        🌐
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-800">
          {sourceDomain ?? "External link"}
        </span>
        {sourceTitle ? (
          <span className="block truncate text-xs text-slate-500">{sourceTitle}</span>
        ) : (
          <span className="block text-xs text-slate-400">Source link</span>
        )}
      </span>
      <span className="shrink-0 text-xs font-bold text-violet-600 transition group-hover:translate-x-0.5">
        Open ↗
      </span>
    </a>
  );
}
