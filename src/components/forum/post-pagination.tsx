"use client";
export function PostPagination({
  page,
  totalPosts,
  pending,
  onSelect,
}: {
  page: number;
  totalPosts: number;
  pending: boolean;
  onSelect: (page: number | "last") => void;
}) {
  if (totalPosts <= 30) return null;
  return (
    <nav
      aria-label="Post pages"
      aria-busy={pending}
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white p-3 text-xs font-semibold text-navy"
    >
      <button
        type="button"
        disabled={page === 0 || pending}
        onClick={() => onSelect(page - 1)}
        className="rounded-lg px-3 py-2 hover:bg-accent-soft disabled:opacity-40"
      >
        ← Previous
      </button>
      <span role="status">
        {pending
          ? "Loading posts…"
          : `Page ${page + 1} of ${Math.ceil(totalPosts / 30)}`}
      </span>
      <button
        type="button"
        disabled={(page + 1) * 30 >= totalPosts || pending}
        onClick={() => onSelect(page + 1)}
        className="rounded-lg px-3 py-2 hover:bg-accent-soft disabled:opacity-40"
      >
        Next →
      </button>
      <button
        type="button"
        disabled={pending || (page + 1) * 30 >= totalPosts}
        onClick={() => onSelect("last")}
        className="rounded-lg bg-accent-soft px-3 py-2 disabled:opacity-40"
      >
        Latest
      </button>
    </nav>
  );
}
