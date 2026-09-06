import Link from "next/link";
import type { ReactNode } from "react";
import { ReplyIcon } from "@/components/ui/icons";

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
  icon?: ReactNode;
  variant?: "card" | "rail";
  activeId?: string;
};

/**
 * Ranked topic index. Rank numbers stay faint so the titles lead; the active
 * row is marked with a navy edge rather than a filled block.
 */
export function TopicSidebar({
  items,
  heading,
  icon,
  variant = "card",
  activeId,
}: TopicSidebarProps) {
  const isRail = variant === "rail";

  return (
    <section className={isRail ? "" : "overflow-hidden rounded-lg border border-line bg-surface"}>
      {heading ? (
        <h2
          className={`flex items-center gap-2 t-section text-ink ${
            isRail ? "pb-2" : "px-4 pb-1.5 pt-3.5 text-[15px]"
          }`}
        >
          {icon ? <span className="text-ink-3">{icon}</span> : null}
          {heading}
        </h2>
      ) : null}

      {items.length === 0 ? (
        <p className={`${isRail ? "py-3" : "px-4 pb-4"} text-[13px] text-ink-4`}>
          Nothing here yet.
        </p>
      ) : (
        <ul className="grid">
          {items.map((item, index) => (
            <li key={item.id}>
              <Link
                aria-current={item.id === activeId ? "page" : undefined}
                className={`group flex items-start gap-2.5 border-l-2 transition-colors ${
                  isRail
                    ? `py-2.5 pl-2.5 pr-1 ${
                        item.id === activeId
                          ? "border-navy bg-navy-wash/60"
                          : "border-transparent hover:border-line-strong hover:bg-sunken"
                      }`
                    : `px-4 py-2 ${item.id === activeId ? "border-navy" : "border-transparent hover:bg-sunken"}`
                }`}
                href={item.href ?? `/?topic=${encodeURIComponent(item.id)}`}
              >
                <span
                  className={`mt-0.5 w-3.5 shrink-0 text-[11px] font-bold tabular-nums ${
                    index < 3 ? "text-navy" : "text-ink-4"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="line-clamp-2 min-w-0 flex-1 text-[13px] font-semibold leading-snug text-ink-2 transition-colors group-hover:text-navy">
                  {item.title}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[11px] font-semibold text-ink-4">
                  <ReplyIcon size={12} />
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
