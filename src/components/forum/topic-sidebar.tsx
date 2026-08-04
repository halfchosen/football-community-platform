import Link from "next/link";

export type SidebarTopicItem = {
  id: string;
  title: string;
  ratingAverage: number;
  ratingCount: number;
  commentCount: number;
  /** Override link target (previews point into the preview hub). */
  href?: string;
};

type TopicSidebarProps = {
  items: SidebarTopicItem[];
  heading?: string;
  icon?: string;
  variant?: "card" | "rail";
};

// "Gündem"-style topic index. The rail variant is a primary navigation
// surface; the card variant is retained for compact contexts.
export function TopicSidebar({
  items,
  heading = "Trending",
  icon = "🔥",
  variant = "card",
}: TopicSidebarProps) {
  const isRail = variant === "rail";

  return (
    <section
      className={
        isRail
          ? "min-h-[calc(100vh-4.75rem)] border-r border-violet-900/10 pr-4"
          : "overflow-hidden rounded-2xl border border-violet-900/10 bg-white shadow-sm shadow-violet-900/5"
      }
    >
      <h2
        className={`flex items-center gap-2 font-extrabold tracking-tight text-slate-900 ${
          isRail
            ? "border-b border-violet-900/10 px-1 pb-3 pt-1 text-lg"
            : "px-4 pb-1.5 pt-3.5 text-base"
        }`}
      >
        <span aria-hidden className={isRail ? "text-base" : "text-sm"}>{icon}</span>
        {heading}
      </h2>
      {items.length === 0 ? (
        <p className={`${isRail ? "px-1 py-4" : "px-4 pb-4"} text-sm font-medium text-slate-400`}>
          Nothing here yet.
        </p>
      ) : (
        <ul className={isRail ? "grid" : "grid pb-1.5"}>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                className={`flex items-start gap-3 transition ${
                  isRail
                    ? "border-b border-slate-200/70 px-1 py-3 hover:bg-white hover:pl-2"
                    : "px-4 py-2 hover:bg-violet-50/70"
                }`}
                href={item.href ?? `/forum/${item.id}`}
              >
                <span
                  className={`line-clamp-2 min-w-0 flex-1 font-semibold leading-snug text-slate-700 transition hover:text-violet-700 ${
                    isRail ? "text-sm" : "text-[13px]"
                  }`}
                >
                  {item.title}
                </span>
                <span className={`shrink-0 pt-0.5 font-bold text-violet-500 ${isRail ? "text-[13px]" : "text-xs"}`}>
                  {item.commentCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
