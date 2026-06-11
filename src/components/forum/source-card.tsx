type SourceCardProps = {
  sourceUrl: string;
  sourceDomain: string | null;
  sourceTitle: string | null;
};

// Link-only source card: domain, optional safe page title, and an outbound
// link. By design it never shows article text, snippets, or images.
export function SourceCard({ sourceUrl, sourceDomain, sourceTitle }: SourceCardProps) {
  return (
    <aside className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
          Source
        </p>
        <p className="mt-1 flex items-center gap-2 font-semibold text-stone-900">
          <span aria-hidden>🌐</span>
          <span className="truncate">{sourceDomain ?? "External link"}</span>
        </p>
        {sourceTitle ? (
          <p className="mt-0.5 truncate text-sm text-stone-500">{sourceTitle}</p>
        ) : null}
      </div>
      <a
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
        href={sourceUrl}
        rel="noopener noreferrer nofollow ugc"
        target="_blank"
      >
        Open source
        <span aria-hidden>↗</span>
      </a>
    </aside>
  );
}
