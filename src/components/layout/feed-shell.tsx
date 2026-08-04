import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";

type FeedShellProps = {
  /** Persistent Trending rail (desktop only). */
  sidebar: ReactNode;
  children: ReactNode;
  searchAction?: string;
  searchValue?: string;
};

// Entry-stream shell: a primary, full-height Trending index on the left and
// the readable content stream on the right.
export function FeedShell({
  sidebar,
  children,
  searchAction,
  searchValue,
}: FeedShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader searchAction={searchAction} searchValue={searchValue} />
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-7 px-4 py-5 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[4.75rem] min-h-[calc(100vh-4.75rem)] max-h-[calc(100vh-4.75rem)] overflow-y-auto pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sidebar}
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
