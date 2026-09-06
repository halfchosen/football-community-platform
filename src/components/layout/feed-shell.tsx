import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { ContextRail } from "@/components/community/context-rail";
import { ChevronDownIcon, TrendIcon } from "@/components/ui/icons";

export function FeedShell({
  sidebar,
  children,
  searchAction,
  searchValue,
  context,
  header,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  searchAction?: string;
  searchValue?: string;
  context?: ReactNode;
  header?: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {header ?? (
        <SiteHeader searchAction={searchAction} searchValue={searchValue} />
      )}
      <div className="site-width community-grid flex-1">
        <aside aria-label="Trending discussions" className="left-rail">
          <div className="rail-sticky">{sidebar}</div>
        </aside>

        <main id="main-content" className="feed-main">
          <details className="group mb-4 rounded-lg border border-line bg-surface lg:hidden">
            <summary className="flex list-none items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <TrendIcon size={15} className="text-ink-3" />
              Trending now
              <ChevronDownIcon
                size={15}
                className="ml-auto text-ink-4 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="max-h-[60dvh] overflow-auto border-t border-line px-3.5 py-3">
              {sidebar}
            </div>
          </details>
          {children}
        </main>

        <aside aria-label="Discussion context" className="context-rail">
          <div className="rail-sticky">{context ?? <ContextRail />}</div>
        </aside>
      </div>
    </div>
  );
}
