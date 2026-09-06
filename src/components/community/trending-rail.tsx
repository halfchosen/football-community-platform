"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  TopicSidebar,
  type SidebarTopicItem,
} from "@/components/forum/topic-sidebar";
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
    <div ref={element} className="grid gap-5">
      <div className="rounded-xl bg-navy-strong p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-mint">
          The touchline
        </p>
        <h2 className="mt-1 text-lg font-bold">Football, from every side.</h2>
        <p className="mt-2 text-xs leading-5 text-mint/70">
          Pick a debate. Have your say.
        </p>
        <Link
          href="/forum/new"
          className="mt-4 flex items-center justify-between rounded-lg bg-teal px-3 py-2.5 text-xs font-bold text-navy-strong"
        >
          Start a topic <span aria-hidden>↗</span>
        </Link>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            The crowd is talking
          </p>
          <span
            title={
              !live
                ? "Preview topics"
                : connected
                  ? "Updates every 30 seconds"
                  : "Updates paused"
            }
            className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-teal" : "bg-slate-400"}`}
          />
        </div>
        <TopicSidebar items={items} variant="rail" activeId={activeId} />
      </div>
      <div className="rounded-xl border border-mint bg-[#F8FAFC] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-navy">
          Here from the start
        </p>
        <h3 className="mt-2 text-base font-bold text-slate-900">
          First Generation
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          1,000 founding places per club. Your number stays yours.
        </p>
        <Link
          href="/community"
          className="mt-3 block text-xs font-bold text-navy"
        >
          How it works →
        </Link>
      </div>
      <nav
        aria-label="Community information"
        className="flex flex-wrap gap-x-3 gap-y-2 px-1 text-[11px] text-slate-400"
      >
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/rules">Rules</Link>
        <Link href="/community">About</Link>
      </nav>
    </div>
  );
}
