"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

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
  const lastPage = (page + 1) * 30 >= totalPosts;

  return (
    <nav
      aria-label="Post pages"
      aria-busy={pending}
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] font-semibold text-ink-2"
    >
      <button
        type="button"
        disabled={page === 0 || pending}
        onClick={() => onSelect(page - 1)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-sunken hover:text-navy disabled:opacity-35"
      >
        <ChevronLeftIcon size={14} />
        Previous
      </button>
      <span role="status" className="tabular-nums text-ink-3">
        {pending
          ? "Loading posts…"
          : `Page ${page + 1} of ${Math.ceil(totalPosts / 30)}`}
      </span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          disabled={pending || lastPage}
          onClick={() => onSelect("last")}
          className="rounded-md px-2 py-1.5 text-ink-3 transition-colors hover:bg-sunken hover:text-navy disabled:opacity-35"
        >
          Latest
        </button>
        <button
          type="button"
          disabled={lastPage || pending}
          onClick={() => onSelect(page + 1)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-sunken hover:text-navy disabled:opacity-35"
        >
          Next
          <ChevronRightIcon size={14} />
        </button>
      </span>
    </nav>
  );
}
