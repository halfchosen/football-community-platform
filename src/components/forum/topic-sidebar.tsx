import Link from "next/link";

export type SidebarTopicItem = {
  id: string;
  title: string;
  ratingAverage: number;
  ratingCount: number;
  contributionCount: number;
  /** Override link target (previews point into the preview hub). */
  href?: string;
  writerCount?: number;
};

type TopicSidebarProps = {
  items: SidebarTopicItem[];
  heading?: string;
  icon?: string;
  variant?: "card" | "rail";
  activeId?: string;
};

// "Gündem"-style topic index. The rail variant is a primary navigation
// surface; the card variant is retained for compact contexts.
export function TopicSidebar({
  items,
  heading = "Trending",
  icon = "🔥",
  variant = "card",
  activeId,
}: TopicSidebarProps) {
  const isRail = variant === "rail";

  return (
    <section
      className={
        isRail
          ? ""
          : "overflow-hidden rounded-xl border border-slate-200 bg-white"
      }
    >
      <h2
        className={`flex items-center gap-2 font-bold tracking-tight text-slate-900 ${
          isRail
            ? "border-b border-slate-200 px-1 pb-3 pt-1 text-lg"
            : "px-4 pb-1.5 pt-3.5 text-base"
        }`}
      >
        <span aria-hidden className={isRail ? "text-base" : "text-sm"}>
          {icon}
        </span>
        {heading}
      </h2>
      {items.length === 0 ? (
        <p
          className={`${isRail ? "px-1 py-4" : "px-4 pb-4"} text-sm font-medium text-slate-400`}
        >
          Nothing here yet.
        </p>
      ) : (
        <ul className={isRail ? "grid" : "grid pb-1.5"}>
          {items.map((item, index) => (
            <li key={item.id}>
              <Link
                aria-current={item.id === activeId ? "page" : undefined}
                className={`group flex items-start gap-3 transition ${
                  isRail
                    ? `rounded-lg border-b border-slate-200/70 px-2 py-3 hover:bg-white ${item.id === activeId ? "bg-accent-soft ring-1 ring-inset ring-mint" : ""}`
                    : "px-4 py-2 hover:bg-slate-50"
                }`}
                href={item.href ?? `/?topic=${encodeURIComponent(item.id)}`}
              >
                {isRail && (
                  <span
                    className={`mt-0.5 w-4 shrink-0 text-[10px] font-bold tabular-nums ${index < 3 ? "text-navy" : "text-slate-300"}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
                <span
                  className={`line-clamp-2 min-w-0 flex-1 font-semibold leading-snug text-slate-700 decoration-navy underline-offset-4 transition group-hover:underline hover:text-navy ${
                    isRail ? "text-sm" : "text-[13px]"
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`shrink-0 pt-0.5 font-bold text-navy ${isRail ? "text-[13px]" : "text-xs"}`}
                >
                  {item.contributionCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
