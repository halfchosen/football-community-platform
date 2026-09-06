"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  TopicSidebar,
  type SidebarTopicItem,
} from "@/components/forum/topic-sidebar";
import { ArrowRightIcon, LiveDot, TrendIcon } from "@/components/ui/icons";

export function TrendingRail({
  initialItems,
  activeId,
  live = true,
}: {
  initialItems: SidebarTopicItem[];
  activeId?: string;
  live?: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(initialItems);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (!live) return;
    let controller: AbortController | null = null;
    const refresh = async () => {
      if (
        document.visibilityState !== "visible" ||
        !element.current?.getClientRects().length
      )
        return;
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/community/trending", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Unavailable");
        setItems((await response.json()) as SidebarTopicItem[]);
        setConnected(true);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setConnected(false);
      }
    };
    const timer = setInterval(() => void refresh(), 30000);
    return () => {
      clearInterval(timer);
      controller?.abort();
    };
  }, [live]);

  return (
    <div ref={element} className="grid gap-7">
      <div>
        <div className="mb-1 flex items-center gap-2 border-b border-line pb-2">
          <TrendIcon size={15} className="text-ink-3" />
          <h2 className="t-section text-ink">Trending now</h2>
          <span
            className="ml-auto"
            title={
              !live
                ? "Preview topics"
                : connected
                  ? "Updates every 30 seconds"
                  : "Updates paused"
            }
          >
            <LiveDot active={live && connected} />
          </span>
        </div>
        <TopicSidebar items={items} variant="rail" activeId={activeId} />
      </div>

      <section className="border-t border-line pt-4">
        <p className="t-eyebrow">First Generation</p>
        <p className="mt-1.5 text-[13px] leading-6 text-ink-2">
          1,000 founding places per club. Your number stays yours.
        </p>
        <Link
          href="/community"
          className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-navy hover:underline"
        >
          How places work
          <ArrowRightIcon size={13} />
        </Link>
      </section>

      <nav
        aria-label="Community information"
        className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-ink-4"
      >
        <Link className="hover:text-ink-2" href="/legal/terms">
          Terms
        </Link>
        <Link className="hover:text-ink-2" href="/legal/privacy">
          Privacy
        </Link>
        <Link className="hover:text-ink-2" href="/legal/rules">
          Rules
        </Link>
        <Link className="hover:text-ink-2" href="/community">
          About
        </Link>
      </nav>
    </div>
  );
}
